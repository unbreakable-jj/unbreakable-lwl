import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, MessageSquarePlus, History, Trash2, ChevronDown, ChevronUp, Loader2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { AuthModal } from '@/components/tracker/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useHelpChat, Message } from '@/hooks/useHelpChat';
import logo from '@/assets/logo.png';

const SAMPLE_QUESTIONS = [
  "I'm stuck on my squat progression — what should I do?",
  "How can I add mobility work into my programme?",
  "My recovery is slow — what adjustments should I make?",
  "How should I progress my pull-ups this week?",
  "What's the best way to warm up before strength training?",
];

function MessageBubble({ message }: { message: Message }) {
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [input, setInput] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    sendMessage(input);
    setInput('');
  };

  const handleSampleQuestion = (question: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setInput(question);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Unbreakable" className="h-10 object-contain" />
            <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
              UNBREAKABLE
            </span>
          </Link>
          <NavigationDrawer />
        </div>
      </header>

      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Hero Section */}
        <section className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-wider mb-4">
            YOUR TRAINING <span className="text-primary neon-glow-subtle">SUPPORT HUB</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Have a question about your programme, exercises, or progress? Type it below to get 
            step-by-step guidance, personalised tips, and support so you can train smarter, 
            stay on track, and reach your goals.
          </p>
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
          {messages.length > 0 && (
            <Card className="mb-6 border-primary/20 neon-border-subtle bg-card/50">
              <CardContent className="p-4">
                <ScrollArea className="h-[400px] pr-4">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex justify-start mb-4">
                      <Card className="bg-card/80 border-primary/20 neon-border-subtle">
                        <CardContent className="p-4 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Sample Questions Carousel */}
          {messages.length === 0 && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3 text-center">Try asking:</p>
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

          {/* Input Section */}
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your question about your programme, exercises, or progress…"
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Get Help
                </>
              )}
            </Button>
          </form>

          {/* Ask Another Question hint */}
          {messages.length > 0 && !isLoading && (
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

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
