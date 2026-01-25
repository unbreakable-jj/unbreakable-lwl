-- Create help_conversations table for storing chat sessions
CREATE TABLE public.help_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create help_messages table for storing individual messages
CREATE TABLE public.help_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.help_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.help_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for help_conversations
CREATE POLICY "Users can view their own conversations"
ON public.help_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.help_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.help_conversations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.help_conversations FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for help_messages
CREATE POLICY "Users can view their own messages"
ON public.help_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages"
ON public.help_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_help_conversations_user_id ON public.help_conversations(user_id);
CREATE INDEX idx_help_messages_conversation_id ON public.help_messages(conversation_id);

-- Trigger to update updated_at
CREATE TRIGGER update_help_conversations_updated_at
BEFORE UPDATE ON public.help_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();