import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ThemedLogo } from '@/components/ThemedLogo';
import { useConversations, Conversation, Message } from '@/hooks/useConversations';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowLeft,
  Send,
  Image,
  Video,
  MoreVertical,
  Trash2,
  Search,
  MessageCircle,
  Check,
  CheckCheck,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Inbox() {
  const { user } = useAuth();
  const { conversations, loading, sendMessage, deleteConversation, markConversationAsRead } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const otherParticipant = conv.participants.find(p => p.user_id !== user?.id);
    const name = otherParticipant?.profile?.display_name || otherParticipant?.profile?.username || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationId: string) => {
    setMessagesLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as Message[]);
      markConversationAsRead(conversationId);
    }
    setMessagesLoading(false);
  };

  // Subscribe to new messages
  useEffect(() => {
    if (!selectedConversation) return;

    fetchMessages(selectedConversation.id);

    const channel = supabase
      .channel(`inbox-chat-${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        () => {
          fetchMessages(selectedConversation.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;
    const text = messageText;
    setMessageText('');
    await sendMessage(selectedConversation.id, text);
  };

  const getMessageStatus = (msg: Message & { read_at?: string; delivered_at?: string; status?: string }): 'sent' | 'delivered' | 'read' => {
    if ((msg as any).read_at) return 'read';
    if ((msg as any).delivered_at) return 'delivered';
    if ((msg as any).status === 'read') return 'read';
    if ((msg as any).status === 'delivered') return 'delivered';
    return 'sent';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please sign in to view messages</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <ThemedLogo className="h-8" />
          </Link>
          <h1 className="font-display text-lg tracking-wide flex-1">
            <span className="text-primary neon-glow-subtle">UNBREAKABLE</span> INBOX
          </h1>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List - Desktop */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-border flex flex-col ${
          selectedConversation ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search */}
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No conversations yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start a conversation from someone's profile
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredConversations.map((conv) => {
                  const otherParticipant = conv.participants.find(p => p.user_id !== user.id);
                  const profile = otherParticipant?.profile;
                  const displayName = profile?.display_name || profile?.username || 'Unknown';
                  const initials = displayName.slice(0, 2).toUpperCase();
                  const isSelected = selectedConversation?.id === conv.id;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                        isSelected ? 'bg-primary/10' : ''
                      } ${conv.unreadCount > 0 ? 'bg-primary/5' : ''}`}
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
                                  addSuffix: false,
                                })}
                              </p>
                            )}
                          </div>
                          {conv.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {conv.lastMessage.sender_id === user.id && 'You: '}
                              {conv.lastMessage.content || '[Media]'}
                            </p>
                          )}
                          {conv.unreadCount > 0 && (
                            <Badge variant="default" className="mt-1 h-5 text-xs">
                              {conv.unreadCount} new
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat View */}
        <div className={`flex-1 flex flex-col ${
          selectedConversation ? 'flex' : 'hidden md:flex'
        }`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                {(() => {
                  const otherParticipant = selectedConversation.participants.find(
                    p => p.user_id !== user.id
                  );
                  const profile = otherParticipant?.profile;
                  const displayName = profile?.display_name || profile?.username || 'Unknown';
                  return (
                    <>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary font-display">
                          {displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{displayName}</p>
                        {profile?.username && (
                          <p className="text-sm text-muted-foreground">@{profile.username}</p>
                        )}
                      </div>
                    </>
                  );
                })()}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        deleteConversation(selectedConversation.id);
                        setSelectedConversation(null);
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <p>No messages yet</p>
                    <p className="text-sm mt-1">Say hello! 👋</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, index) => {
                      const isOwn = msg.sender_id === user.id;
                      const showDate = index === 0 || 
                        new Date(msg.created_at).toDateString() !== 
                        new Date(messages[index - 1].created_at).toDateString();
                      const status = getMessageStatus(msg);

                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="text-center text-xs text-muted-foreground my-4">
                              {format(new Date(msg.created_at), 'MMMM d, yyyy')}
                            </div>
                          )}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
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
                              <div className={`flex items-center gap-1 mt-1 ${
                                isOwn ? 'justify-end' : ''
                              }`}>
                                <span
                                  className={`text-xs ${
                                    isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                  }`}
                                >
                                  {format(new Date(msg.created_at), 'HH:mm')}
                                </span>
                                {isOwn && (
                                  <span className={`${
                                    status === 'read' ? 'text-primary-foreground' : 'text-primary-foreground/50'
                                  }`}>
                                    {status === 'read' ? (
                                      <CheckCheck className="w-3.5 h-3.5" />
                                    ) : status === 'delivered' ? (
                                      <CheckCheck className="w-3.5 h-3.5" />
                                    ) : (
                                      <Check className="w-3.5 h-3.5" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" disabled>
                    <Image className="w-5 h-5" />
                  </Button>
                  <Button variant="ghost" size="sm" disabled>
                    <Video className="w-5 h-5" />
                  </Button>
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a conversation</p>
                <p className="text-sm mt-1">Choose from your existing conversations</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
