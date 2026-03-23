import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useBlockedUsers } from './useBlockedUsers';
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  sender?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  participants: {
    user_id: string;
    joined_at: string;
    last_read_at: string | null;
    profile?: {
      display_name: string | null;
      username: string | null;
      avatar_url: string | null;
    };
  }[];
  lastMessage?: Message | null;
  unreadCount: number;
}

export function useConversations() {
  const { user } = useAuth();
  const { blockedUsers, isUserBlocked, checkIfBlockedBy } = useBlockedUsers();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Get conversation IDs the user participates in
    const { data: participations, error: partError } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', user.id)
      .eq('is_deleted', false);

    if (partError || !participations?.length) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const conversationIds = participations.map((p) => p.conversation_id);
    const lastReadMap = participations.reduce((acc, p) => {
      acc[p.conversation_id] = p.last_read_at;
      return acc;
    }, {} as Record<string, string | null>);

    // Get conversations
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .in('id', conversationIds)
      .order('last_message_at', { ascending: false });

    if (convError) {
      console.error('Error fetching conversations:', convError);
      setLoading(false);
      return;
    }

    // Get all participants for these conversations
    // Fetch ALL participants (including those who soft-deleted the conversation)
    // so the other party still sees the correct name/avatar.
    const { data: allParticipants } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id, joined_at, last_read_at')
      .in('conversation_id', conversationIds);

    // Get participant profiles
    const participantIds = [...new Set((allParticipants || []).map((p) => p.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, display_name, username, avatar_url')
      .in('user_id', participantIds);

    const profileMap = (profiles || []).reduce((acc, p) => {
      acc[p.user_id] = p;
      return acc;
    }, {} as Record<string, any>);

    // Get last message for each conversation
    const { data: lastMessages } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', conversationIds)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    const lastMessageMap: Record<string, Message | undefined> = {};
    (lastMessages || []).forEach((msg) => {
      if (!lastMessageMap[msg.conversation_id]) {
        lastMessageMap[msg.conversation_id] = msg as Message;
      }
    });

    // Get unread counts
    const unreadCounts: Record<string, number> = {};
    for (const convId of conversationIds) {
      const lastRead = lastReadMap[convId];
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', convId)
        .eq('is_deleted', false)
        .neq('sender_id', user.id)
        .gt('created_at', lastRead || '1970-01-01');
      unreadCounts[convId] = count || 0;
    }

    // Build conversation objects
    const convs: Conversation[] = (convData || []).map((c) => {
      const participants = (allParticipants || [])
        .filter((p) => p.conversation_id === c.id)
        .map((p) => ({
          ...p,
          profile: profileMap[p.user_id],
        }));

      return {
        ...c,
        participants,
        lastMessage: lastMessageMap[c.id] || null,
        unreadCount: unreadCounts[c.id] || 0,
      };
    });

    // Filter out conversations with blocked users
    const blockedIds = new Set(blockedUsers.map(b => b.blocked_id));
    const filteredConvs = convs.filter((conv) => {
      const otherParticipant = conv.participants.find((p) => p.user_id !== user?.id);
      if (!otherParticipant) return true;
      return !blockedIds.has(otherParticipant.user_id);
    });

    setConversations(filteredConvs);
    setLoading(false);
  }, [user, blockedUsers]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConversations]);

  const startConversation = async (recipientId: string) => {
    if (!user) return { error: new Error('Not authenticated'), conversation: null };

    // Check if user is blocked or has blocked the recipient
    if (isUserBlocked(recipientId)) {
      return { error: new Error('Cannot message a blocked user'), conversation: null };
    }
    
    const isBlockedByRecipient = await checkIfBlockedBy(recipientId);
    if (isBlockedByRecipient) {
      return { error: new Error('You cannot message this user'), conversation: null };
    }

    // Create-or-get conversation server-side (enforces messaging + block rules)
    const { data: convId, error: rpcError } = await supabase
      .rpc('start_or_get_conversation', { recipient_id: recipientId });

    if (rpcError) return { error: rpcError, conversation: null };

    await fetchConversations();

    // Return a minimal conversation object (callers only need the id for navigation)
    const id = typeof convId === 'string' ? convId : (convId as any)?.toString?.();
    return { error: null, conversation: id ? ({ id } as any) : null };
  };

  const sendMessage = async (
    conversationId: string,
    content: string,
    imageUrl?: string,
    videoUrl?: string
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    // Get the other participant and check if blocked
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      const otherParticipant = conv.participants.find(p => p.user_id !== user.id);
      if (otherParticipant) {
        if (isUserBlocked(otherParticipant.user_id)) {
          return { error: new Error('Cannot message a blocked user') };
        }
        const isBlockedByRecipient = await checkIfBlockedBy(otherParticipant.user_id);
        if (isBlockedByRecipient) {
          return { error: new Error('You cannot message this user') };
        }
      }
    }

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: content || null,
      image_url: imageUrl || null,
      video_url: videoUrl || null,
    });

    if (!error) {
      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    return { error };
  };

  // Delete message for current user only (soft delete via local state)
  const deleteMessageForMe = async (messageId: string) => {
    if (!user) return { error: new Error('Not authenticated') };
    
    // We'll track deleted-for-me messages in local storage
    const storageKey = `deleted_messages_${user.id}`;
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!existing.includes(messageId)) {
      existing.push(messageId);
      localStorage.setItem(storageKey, JSON.stringify(existing));
    }
    
    return { error: null };
  };

  // Delete message for everyone (only sender can do this)
  const deleteMessageForEveryone = async (messageId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('messages')
      .update({ is_deleted: true })
      .eq('id', messageId)
      .eq('sender_id', user.id);

    return { error };
  };

  // Legacy function for backwards compatibility
  const deleteMessage = async (messageId: string) => {
    return deleteMessageForEveryone(messageId);
  };
  
  // Get deleted-for-me message IDs
  const getDeletedForMeIds = (): string[] => {
    if (!user) return [];
    const storageKey = `deleted_messages_${user.id}`;
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('conversation_participants')
      .update({ is_deleted: true })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);

    if (!error) {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    }

    return { error };
  };

  const markConversationAsRead = async (conversationId: string) => {
    if (!user) return;

    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
  };

  const unreadCount = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return {
    conversations,
    loading,
    unreadCount,
    startConversation,
    sendMessage,
    deleteMessage,
    deleteMessageForMe,
    deleteMessageForEveryone,
    getDeletedForMeIds,
    deleteConversation,
    markConversationAsRead,
    refetch: fetchConversations,
  };
}
