import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConversations, Conversation, Message } from '@/hooks/useConversations';
import { useUserSearch, SearchResult } from '@/hooks/useUserSearch';
import { useFriends } from '@/hooks/useFriends';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  X,
  MessageCircle,
  ArrowLeft,
  Send,
  Image,
  Video,
  Trash2,
  MoreVertical,
  Plus,
  Search,
  Loader2,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessagesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

function ConversationList({
  conversations,
  onSelect,
  onDelete,
  currentUserId,
}: {
  conversations: Conversation[];
  onSelect: (conv: Conversation) => void;
  onDelete: (id: string) => void;
  currentUserId: string;
}) {
  return (
    <div className="divide-y divide-border">
      {conversations.length === 0 ? (
        <div className="p-8 text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No conversations yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Start a conversation from someone's profile
          </p>
        </div>
      ) : (
        conversations.map((conv) => {
          const otherParticipant = conv.participants.find(
            (p) => p.user_id !== currentUserId
          );
          const profile = otherParticipant?.profile;
          const displayName = profile?.display_name || profile?.username || 'Unknown';
          const initials = displayName.slice(0, 2).toUpperCase();

          return (
            <div
              key={conv.id}
              className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                conv.unreadCount > 0 ? 'bg-primary/5' : ''
              }`}
              onClick={() => onSelect(conv)}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary font-display">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground truncate">{displayName}</p>
                    {conv.lastMessage && (
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.lastMessage.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conv.lastMessage.content || '[Media]'}
                    </p>
                  )}
                  {conv.unreadCount > 0 && (
                    <span className="inline-block mt-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {conv.unreadCount} new
                    </span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(conv.id);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function ChatView({
  conversation,
  onBack,
  currentUserId,
}: {
  conversation: Conversation;
  onBack: () => void;
  currentUserId: string;
}) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { sendMessage, deleteMessage, markConversationAsRead } = useConversations();

  const otherParticipant = conversation.participants.find(
    (p) => p.user_id !== currentUserId
  );
  const profile = otherParticipant?.profile;
  const displayName = profile?.display_name || profile?.username || 'Unknown';

  // Fetch messages
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (!error) {
      setMessages(data as Message[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
    markConversationAsRead(conversation.id);
  }, [conversation.id]);

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id]);

  const handleSend = async () => {
    if (!message.trim()) return;
    const text = message;
    setMessage('');
    await sendMessage(conversation.id, text);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/20 text-primary font-display">
            {displayName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{displayName}</p>
          {profile?.username && (
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet</p>
            <p className="text-sm mt-1">Say hello!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwn = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted rounded-bl-sm'
                    }`}
                  >
                    {msg.image_url && (
                      <img
                        src={msg.image_url}
                        alt="Shared image"
                        className="rounded-lg max-w-full mb-2"
                      />
                    )}
                    {msg.video_url && (
                      <video
                        src={msg.video_url}
                        controls
                        className="rounded-lg max-w-full mb-2"
                      />
                    )}
                    {msg.content && <p>{msg.content}</p>}
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}
                    >
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled>
            <Image className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" disabled>
            <Video className="w-5 h-5" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button onClick={handleSend} disabled={!message.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function MessagesPanel({ isOpen, onClose }: MessagesPanelProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, loading, deleteConversation, startConversation } = useConversations();
  const { results: searchResults, loading: searchLoading, searchUsers, clearResults } = useUserSearch();
  const { friends } = useFriends();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [starting, setStarting] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      searchUsers(value);
    } else {
      clearResults();
    }
  };

  const handleSelectUser = async (userId: string, name: string) => {
    setStarting(true);
    const { error, conversation } = await startConversation(userId);
    if (error) {
      toast.error(error.message || 'Failed to start conversation');
    } else if (conversation) {
      toast.success(`Opening chat with ${name}…`);
      onClose();
      navigate(`/inbox?cid=${conversation.id}`);
    }
    setStarting(false);
  };

  const displayResults = searchQuery.length >= 2 ? searchResults : [];

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
          >
            {selectedConversation ? (
              <ChatView
                conversation={selectedConversation}
                onBack={() => setSelectedConversation(null)}
                currentUserId={user.id}
              />
            ) : showNewMessage ? (
              /* New Message Composer */
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <Button variant="ghost" size="sm" onClick={() => { setShowNewMessage(false); setSearchQuery(''); clearResults(); }}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="font-display text-lg tracking-wide">NEW MESSAGE</h2>
                </div>

                {/* Search Input */}
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Results / Friends */}
                <ScrollArea className="flex-1 p-4">
                  {searchLoading || starting ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : displayResults.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground px-2 py-1">Search Results</p>
                      {displayResults.map((u) => (
                        <UserRow key={u.user_id} user={u} onSelect={handleSelectUser} disabled={starting} />
                      ))}
                    </div>
                  ) : searchQuery.length >= 2 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No users found</p>
                    </div>
                  ) : friends.length > 0 ? (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground px-2 py-1 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Your Friends
                      </p>
                      {friends.map((friend) => (
                        <UserRow
                          key={friend.user_id}
                          user={{
                            user_id: friend.user_id,
                            display_name: friend.display_name,
                            username: friend.username,
                            avatar_url: friend.avatar_url,
                          }}
                          onSelect={handleSelectUser}
                          disabled={starting}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Search for users to start a conversation</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <h2 className="font-display text-lg tracking-wide">MESSAGES</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="gap-1" onClick={() => setShowNewMessage(true)}>
                      <Plus className="w-4 h-4" />
                      New
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <ScrollArea className="flex-1">
                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </div>
                  ) : (
                    <ConversationList
                      conversations={conversations}
                      onSelect={setSelectedConversation}
                      onDelete={deleteConversation}
                      currentUserId={user.id}
                    />
                  )}
                </ScrollArea>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* Helper component for user rows in new message composer */
function UserRow({
  user,
  onSelect,
  disabled,
}: {
  user: SearchResult;
  onSelect: (userId: string, name: string) => void;
  disabled?: boolean;
}) {
  const displayName = user.display_name || user.username || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <button
      onClick={() => onSelect(user.user_id, displayName)}
      disabled={disabled}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors disabled:opacity-50"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/20 text-primary font-display">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="text-left flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{displayName}</p>
        {user.username && (
          <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
        )}
      </div>
      <MessageCircle className="w-4 h-4 text-muted-foreground" />
    </button>
  );
}
