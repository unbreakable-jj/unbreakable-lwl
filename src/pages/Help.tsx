import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Send, MessageSquarePlus, History, Trash2, ChevronDown, ChevronUp, Loader2, Flame, Dumbbell, Sparkles, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { PageNavigation, SwipeNavigationWrapper } from '@/components/PageNavigation';
import { AuthModal } from '@/components/tracker/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useHelpChat, Message } from '@/hooks/useHelpChat';
import { ThemedLogo } from '@/components/ThemedLogo';
import { VoiceSettingsSheet } from '@/components/coaching/VoiceSettingsSheet';
import { ChatMediaUpload, ChatMedia } from '@/components/coaching/ChatMediaUpload';
import { useAIProgramme } from '@/hooks/useAIProgramme';
import { toast } from '@/hooks/use-toast';

const SAMPLE_QUESTIONS = [
  "Build me a 4-day strength programme",
  "I want to lose fat and build muscle — help me!",
  "Create a home workout plan with minimal equipment",
  "I'm stuck on my squat progression — what should I do?",
  "Design a programme for a beginner lifter",
  "My recovery is slow — what adjustments should I make?",
];

interface MessageWithMedia extends Message {
  media?: ChatMedia;
}

function MessageBubble({ message }: { message: MessageWithMedia }) {
  const isUser = message.role === 'user';
  
  // Simple markdown parsing for bold and numbered lists
  const formatContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Bold text
      const boldParsed = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>');
      return (
        <p 
          key={i} 
          className={i > 0 ? 'mt-2' : ''} 
          dangerouslySetInnerHTML={{ __html: boldParsed }}
        />
      );
    });
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        <Card className={`${isUser 
          ? 'bg-primary/20 border-primary/40' 
          : 'bg-card/80 border-primary/20 neon-border-subtle'}`}
        >
          <CardContent className="p-4">
            {/* Media preview if attached */}
            {message.media && (
              <div className="mb-3">
                {message.media.type === 'image' ? (
                  <img 
                    src={message.media.url} 
                    alt="Attached" 
                    className="rounded-lg max-h-48 object-cover"
                  />
                ) : (
                  <video 
                    src={message.media.url} 
                    controls 
                    className="rounded-lg max-h-48 w-full"
                  />
                )}
              </div>
            )}
            <div className={`text-sm ${isUser ? 'text-foreground' : 'text-foreground/90'}`}>
              {isUser ? message.content : formatContent(message.content)}
            </div>
          </CardContent>
        </Card>
        <p className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export default function Help() {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [input, setInput] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ChatMedia | null>(null);
  const [messagesWithMedia, setMessagesWithMedia] = useState<Map<string, ChatMedia>>(new Map());
  const [programmeGenerating, setProgrammeGenerating] = useState(false);
  const { user } = useAuth();
  
  const {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    conversationsLoading,
    sendMessage,
    loadConversation,
    deleteConversation,
    startNewConversation,
  } = useHelpChat();

  const { generateProgramme, detectProgrammeRequest, isGenerating } = useAIProgramme();

  // Check for context from other screens
  useEffect(() => {
    const storedContext = sessionStorage.getItem('coach_context');
    if (storedContext) {
      try {
        const context = JSON.parse(storedContext);
        // Pre-fill input with context-aware prompt
        let prompt = '';
        switch (context.type) {
          case 'session':
            prompt = `I just finished a workout session${context.name ? ` (${context.name})` : ''}. Can you give me feedback on my performance?`;
            break;
          case 'programme':
            prompt = `I'd like to discuss my training programme${context.name ? ` "${context.name}"` : ''}. `;
            break;
          case 'programme_request':
            prompt = `Build me a bespoke training programme. `;
            break;
          case 'exercise':
            prompt = `Can you review my technique for ${context.name || 'this exercise'}?`;
            break;
          case 'progress':
            prompt = `I'd like you to analyse my training progress and suggest improvements.`;
            break;
        }
        if (prompt) {
          setInput(prompt);
        }
      } catch (e) {
        console.error('Failed to parse coach context:', e);
      } finally {
        sessionStorage.removeItem('coach_context');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedMedia) || isLoading || isGenerating) return;
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Build message content with media context
    let messageContent = input;
    if (selectedMedia) {
      const mediaContext = selectedMedia.type === 'video' 
        ? `[Attached video: ${selectedMedia.name}]` 
        : `[Attached image: ${selectedMedia.name}]`;
      messageContent = messageContent 
        ? `${messageContent}\n\n${mediaContext}` 
        : `Please review this ${selectedMedia.type}: ${selectedMedia.name}`;
    }
    
    // Check if this is a programme request
    if (detectProgrammeRequest(messageContent)) {
      setProgrammeGenerating(true);
      
      // Add user message to chat first
      const userMsg = messageContent;
      sendMessage(userMsg);
      setInput('');
      setSelectedMedia(null);
      
      // Generate programme
      const result = await generateProgramme(userMsg, {
        chatContext: messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n'),
      });
      
      setProgrammeGenerating(false);
      
      if (result?.savedToHub) {
        // Add assistant response about the programme
        setTimeout(() => {
          const programmeResponse = `🎉 **Your bespoke programme is ready!**

I've created **"${result.program.programName}"** just for you. Here's what I built:

${result.program.overview}

**What's included:**
- ${result.program.templateWeek?.days?.length || 0} training days per week
- ${result.program.phases?.length || 3} periodized phases over 12 weeks
- Detailed coaching notes for every exercise
- Progression rules tailored to your goals

**Your programme is now in your My Programmes hub** (Power → My Programmes). From there you can:
1. Preview the full programme
2. Make any edits you want
3. Start it when you're ready

The programme won't auto-start — you're in control. When you're ready, hit "Start" and I'll generate your 12-week training schedule.

Got questions about the programme? Just ask! 💪`;
          
          sendMessage(programmeResponse);
        }, 500);
        
        toast({
          title: 'Programme Created!',
          description: 'View it in Power → My Programmes',
          action: (
            <Button variant="outline" size="sm" onClick={() => navigate('/programming')}>
              View Programme
            </Button>
          ),
        });
      }
      return;
    }
    
    // Store media reference for the message we're about to send
    if (selectedMedia) {
      const tempId = `temp_${Date.now()}`;
      setMessagesWithMedia(prev => new Map(prev).set(tempId, selectedMedia));
    }
    
    sendMessage(messageContent);
    setInput('');
    setSelectedMedia(null);
  };

  const handleSampleQuestion = (question: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setInput(question);
  };

  // Merge messages with their media
  const enrichedMessages: MessageWithMedia[] = messages.map((msg, idx) => {
    // Try to find media for this message (simplified - in production you'd store this properly)
    const mediaEntry = Array.from(messagesWithMedia.entries()).find(
      ([key]) => key.includes(msg.id) || (msg.role === 'user' && idx === messages.length - 2)
    );
    return {
      ...msg,
      media: mediaEntry?.[1],
    };
  });

  return (
    <SwipeNavigationWrapper>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <ThemedLogo />
              <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                UNBREAKABLE
              </span>
            </Link>
            <div className="flex items-center gap-2">
              {/* Voice Settings Icon */}
              <VoiceSettingsSheet />
              <NavigationDrawer />
            </div>
          </div>
        </header>

        {/* Page Navigation */}
        <div className="pt-[72px]">
          <PageNavigation />
        </div>

        <main className="container mx-auto px-4 pt-4 pb-8">
        {/* Hero Section */}
        <section className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Flame className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-wider mb-2">
            UNBREAKABLE <span className="text-primary neon-glow-subtle">COACHING</span>
          </h1>
          <p className="text-primary font-display text-xl md:text-2xl tracking-wide mt-4 neon-glow-subtle">
            LIVE WITHOUT LIMITS
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mt-4">
            Your personal coach for everything training, nutrition, mindset, and beyond. 
            Ask about your programme, get form tips, debate workout playlists, or just need 
            a pep talk — I've got you. Let's build something <span className="text-primary font-semibold">UNBREAKABLE</span>.
          </p>
          <p className="text-primary font-display text-lg mt-3 neon-glow-subtle">KEEP SHOWING UP.</p>
        </section>

        <div className="max-w-4xl mx-auto">
          {/* Query History (Collapsible) */}
          {user && conversations.length > 0 && (
            <Collapsible open={historyOpen} onOpenChange={setHistoryOpen} className="mb-6">
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Recent Conversations ({conversations.length})
                  </span>
                  {historyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="border-primary/20 neon-border-subtle">
                  <CardContent className="p-3">
                    <ScrollArea className="h-48">
                      {conversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={`flex items-center justify-between p-2 rounded-lg mb-1 cursor-pointer transition-colors ${
                            currentConversationId === conv.id 
                              ? 'bg-primary/20 border border-primary/40' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => loadConversation(conv.id)}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{conv.title || 'Untitled'}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(conv.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConversation(conv.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* New Conversation Button */}
          {user && currentConversationId && (
            <Button
              variant="outline"
              className="mb-4 w-full"
              onClick={startNewConversation}
            >
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              Start New Conversation
            </Button>
          )}

          {/* Chat Messages */}
          {enrichedMessages.length > 0 && (
            <Card className="mb-6 border-primary/20 neon-border-subtle bg-card/50">
              <CardContent className="p-4">
                <ScrollArea className="h-[400px] pr-4">
                  {enrichedMessages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  {isLoading && enrichedMessages[enrichedMessages.length - 1]?.role === 'user' && !isGenerating && (
                    <div className="flex justify-start mb-4">
                      <Card className="bg-card/80 border-primary/20 neon-border-subtle">
                        <CardContent className="p-4 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Coach is typing...</span>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                  {isGenerating && (
                    <div className="flex justify-start mb-4">
                      <Card className="bg-primary/10 border-primary/30 neon-border-subtle">
                        <CardContent className="p-4 flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                          <div>
                            <span className="text-sm font-medium text-primary">Building your bespoke programme...</span>
                            <p className="text-xs text-muted-foreground mt-1">This takes about 15-20 seconds</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Sample Questions Carousel */}
          {enrichedMessages.length === 0 && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3 text-center">Try asking your coach:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SAMPLE_QUESTIONS.map((question, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs border-primary/30 hover:border-primary hover:bg-primary/10"
                    onClick={() => handleSampleQuestion(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Section - Text only, no voice reply controls */}
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Media preview */}
            {selectedMedia && (
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  {selectedMedia.type === 'image' ? (
                    <img 
                      src={selectedMedia.url} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Video className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedMedia.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedMedia.type === 'video' ? 'Video attached' : 'Image attached'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedMedia(null)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex gap-2 items-center">
              {/* Media upload buttons */}
              <ChatMediaUpload
                onMediaSelect={setSelectedMedia}
                selectedMedia={selectedMedia}
                onClearMedia={() => setSelectedMedia(null)}
                disabled={isLoading}
              />
              
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your coach anything — training, nutrition, motivation..."
                className="flex-1"
                disabled={isLoading || isGenerating}
              />
              <Button type="submit" disabled={isLoading || isGenerating || (!input.trim() && !selectedMedia)}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Ask Coach
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Ask Another Question hint */}
          {enrichedMessages.length > 0 && !isLoading && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              Type another question above or{' '}
              <button 
                className="text-primary hover:underline"
                onClick={startNewConversation}
              >
                start a new conversation
              </button>
            </p>
          )}
        </div>
      </main>

        <UnifiedFooter />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    </SwipeNavigationWrapper>
  );
}
