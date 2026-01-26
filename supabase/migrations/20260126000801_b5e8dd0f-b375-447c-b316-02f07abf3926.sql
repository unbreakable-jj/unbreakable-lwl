-- =============================================
-- MESSAGING SYSTEM
-- =============================================

-- Conversations (can be 1:1 or group)
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Conversation participants
CREATE TABLE public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(conversation_id, user_id)
);

-- Messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT,
  image_url TEXT,
  video_url TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- NOTIFICATIONS SYSTEM
-- =============================================
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'friend_request', 'friend_accepted', 'post_like', 'post_comment', 'workout_like', 'run_like', 'message', 'milestone', 'story_view'
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- ONLINE STATUS SYSTEM
-- =============================================
CREATE TABLE public.user_presence (
  user_id UUID NOT NULL PRIMARY KEY,
  is_online BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- USER SETTINGS UPDATES - Add messaging & online status settings
-- =============================================
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS allow_messages TEXT DEFAULT 'friends',
ADD COLUMN IF NOT EXISTS show_online_status BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_messages BOOLEAN DEFAULT true;

-- =============================================
-- ENABLE RLS ON ALL NEW TABLES
-- =============================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTION: Check if user can message another user
-- =============================================
CREATE OR REPLACE FUNCTION public.can_message_user(sender_id UUID, recipient_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN sender_id = recipient_id THEN true
    WHEN (SELECT allow_messages FROM public.user_settings WHERE user_id = recipient_id) = 'everyone' THEN true
    WHEN (SELECT allow_messages FROM public.user_settings WHERE user_id = recipient_id) = 'friends' 
      AND are_friends(sender_id, recipient_id) THEN true
    WHEN (SELECT allow_messages FROM public.user_settings WHERE user_id = recipient_id) = 'none' THEN false
    ELSE are_friends(sender_id, recipient_id) -- default to friends only
  END;
$$;

-- =============================================
-- HELPER FUNCTION: Check if user is in conversation
-- =============================================
CREATE OR REPLACE FUNCTION public.is_conversation_participant(user_uuid UUID, conv_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = conv_id
    AND user_id = user_uuid
    AND is_deleted = false
  );
$$;

-- =============================================
-- RLS POLICIES: CONVERSATIONS
-- =============================================
CREATE POLICY "Users can view conversations they participate in"
ON public.conversations FOR SELECT
USING (is_conversation_participant(auth.uid(), id));

CREATE POLICY "Authenticated users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Participants can update conversation"
ON public.conversations FOR UPDATE
USING (is_conversation_participant(auth.uid(), id));

-- =============================================
-- RLS POLICIES: CONVERSATION PARTICIPANTS
-- =============================================
CREATE POLICY "Users can view participants of their conversations"
ON public.conversation_participants FOR SELECT
USING (is_conversation_participant(auth.uid(), conversation_id));

CREATE POLICY "Users can add participants"
ON public.conversation_participants FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own participation"
ON public.conversation_participants FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own participation"
ON public.conversation_participants FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES: MESSAGES
-- =============================================
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (is_conversation_participant(auth.uid(), conversation_id));

CREATE POLICY "Users can send messages to their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id 
  AND is_conversation_participant(auth.uid(), conversation_id)
);

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages"
ON public.messages FOR DELETE
USING (auth.uid() = sender_id);

-- =============================================
-- RLS POLICIES: NOTIFICATIONS
-- =============================================
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES: USER PRESENCE
-- =============================================
CREATE POLICY "Online status viewable based on settings"
ON public.user_presence FOR SELECT
USING (
  user_id = auth.uid()
  OR (
    (SELECT show_online_status FROM public.user_settings WHERE user_id = user_presence.user_id) = true
    AND (
      (SELECT profile_visibility FROM public.user_settings WHERE user_id = user_presence.user_id) = 'public'
      OR are_friends(auth.uid(), user_presence.user_id)
    )
  )
);

CREATE POLICY "Users can manage their own presence"
ON public.user_presence FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presence"
ON public.user_presence FOR UPDATE
USING (auth.uid() = user_id);

-- =============================================
-- UPDATE TRIGGER FOR CONVERSATIONS
-- =============================================
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ENABLE REALTIME FOR MESSAGING
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_presence;