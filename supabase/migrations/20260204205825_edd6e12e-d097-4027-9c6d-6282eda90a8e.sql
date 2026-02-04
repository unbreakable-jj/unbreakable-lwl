-- Fix messaging creation by providing a secure RPC and tightening insert policies

-- 1) RPC: create (or find) a 1:1 conversation between two users
CREATE OR REPLACE FUNCTION public.start_or_get_conversation(recipient_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sender uuid;
  existing_conv uuid;
  conv_id uuid;
BEGIN
  sender := auth.uid();
  IF sender IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF recipient_id IS NULL THEN
    RAISE EXCEPTION 'Recipient is required';
  END IF;

  IF recipient_id = sender THEN
    RAISE EXCEPTION 'Cannot message yourself';
  END IF;

  -- Block + privacy checks (server-side)
  IF public.has_block_between(sender, recipient_id) THEN
    RAISE EXCEPTION 'Messaging not allowed (blocked)';
  END IF;

  IF NOT public.can_message_user(sender, recipient_id) THEN
    RAISE EXCEPTION 'Messaging not allowed by recipient settings';
  END IF;

  -- Existing non-deleted 1:1 conversation?
  SELECT cp1.conversation_id
    INTO existing_conv
  FROM public.conversation_participants cp1
  JOIN public.conversation_participants cp2
    ON cp2.conversation_id = cp1.conversation_id
  WHERE cp1.user_id = sender
    AND cp2.user_id = recipient_id
    AND cp1.is_deleted = false
    AND cp2.is_deleted = false
  LIMIT 1;

  IF existing_conv IS NOT NULL THEN
    RETURN existing_conv;
  END IF;

  -- Create conversation
  INSERT INTO public.conversations DEFAULT VALUES
  RETURNING id INTO conv_id;

  -- Add both participants
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES (conv_id, sender), (conv_id, recipient_id);

  RETURN conv_id;
END;
$$;

REVOKE ALL ON FUNCTION public.start_or_get_conversation(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_or_get_conversation(uuid) TO authenticated;

-- 2) Ensure conversation creation policy is explicitly for authenticated users
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users can create conversations"
ON public.conversations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 3) Tighten participant inserts: client can only insert their own participant row (RPC bypasses RLS)
DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;
CREATE POLICY "Users can add themselves as participant"
ON public.conversation_participants
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
