import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Send, MessageSquarePlus, Trash2, Loader2, Flame, Sparkles, Video, UtensilsCrossed, PanelLeftClose, PanelLeftOpen, Dumbbell, TrendingUp, BarChart3, Brain, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { ThemeToggle } from '@/components/hub/ThemeToggle';
import { UnifiedFooter } from '@/components/UnifiedFooter';
import { PageNavigation, SwipeNavigationWrapper } from '@/components/PageNavigation';
import { AuthModal } from '@/components/tracker/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import { useHelpChat, Message } from '@/hooks/useHelpChat';
import { ThemedLogo } from '@/components/ThemedLogo';
import { VoiceSettingsSheet } from '@/components/coaching/VoiceSettingsSheet';
import { ChatMediaUpload, ChatMedia } from '@/components/coaching/ChatMediaUpload';
import { ProfileButton } from '@/components/coaching/ProfileButton';
import { PlanDisplayCard } from '@/components/coaching/PlanDisplayCard';
import { AIPlanReviewModal } from '@/components/ai/AIPlanReviewModal';
import { useAIProgramme } from '@/hooks/useAIProgramme';
import { useAIMealPlan } from '@/hooks/useAIMealPlan';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useMealPlans } from '@/hooks/useMealPlans';
import { toast } from '@/hooks/use-toast';
import { GeneratedProgram } from '@/lib/programTypes';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessageWithMedia extends Message {
  media?: ChatMedia;
}

interface GeneratedPlanInfo {
  type: 'programme' | 'meal_plan';
  planData: any;
  planId: string;
  savedToHub: boolean;
  messageId?: string;
}

// ─── Neon Glass Message Bubble ───────────────────────────────────────────────
function MessageBubble({ message }: { message: MessageWithMedia }) {
  const isUser = message.role === 'user';

  const formatContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/);
      return (
        <p key={i} className={i > 0 ? 'mt-2' : ''}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j} className="text-primary">{part}</strong> : part
          )}
        </p>
      );
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5 animate-fade-in`}>
      {/* Coach avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mr-3 mt-1">
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center neon-border-subtle">
            <Flame className="w-4 h-4 text-primary" />
          </div>
        </div>
      )}
      <div className={`max-w-[80%]`}>
        <div className={`rounded-2xl px-5 py-4 backdrop-blur-md ${
          isUser
            ? 'bg-primary/15 border border-primary/30 rounded-br-md'
            : 'bg-card/60 border border-primary/20 rounded-bl-md shadow-[0_0_15px_hsl(24_100%_50%/0.08)]'
        }`}>
          {message.media && (
            <div className="mb-3">
              {message.media.type === 'image' ? (
                <img src={message.media.url} alt="Attached" className="rounded-xl max-h-52 object-cover" />
              ) : (
                <video src={message.media.url} controls className="rounded-xl max-h-52 w-full" />
              )}
            </div>
          )}
          <div className={`text-sm leading-relaxed ${isUser ? 'text-foreground' : 'text-foreground/90'}`}>
            {isUser ? message.content : formatContent(message.content)}
          </div>
        </div>
        <p className={`text-[11px] text-muted-foreground mt-1.5 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// ─── Quick Action Tiles ──────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: Dumbbell, label: 'POWER', description: 'Build a training programme', prompt: "I'd like to build a new training programme.", color: 'from-primary/20 to-primary/5' },
  { icon: TrendingUp, label: 'MOVEMENT', description: 'Improve technique & cardio', prompt: 'Give me tips to improve my squat form.', color: 'from-primary/15 to-primary/5' },
  { icon: UtensilsCrossed, label: 'FUEL', description: 'Create a nutrition plan', prompt: "I'd like to create a nutrition plan.", color: 'from-primary/20 to-primary/5' },
  { icon: Brain, label: 'MINDSET', description: 'Mental performance coaching', prompt: 'Help me build a mindset routine for consistency and focus.', color: 'from-primary/15 to-primary/5' },
];

function QuickActionTiles({ onSelect, disabled }: { onSelect: (prompt: string) => void; disabled?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
      {QUICK_ACTIONS.map(({ icon: Icon, label, description, prompt, color }) => (
        <button
          key={label}
          onClick={() => onSelect(prompt)}
          disabled={disabled}
          className={`group relative p-5 rounded-xl border border-primary/20 bg-gradient-to-br ${color}
            hover:border-primary/50 hover:shadow-[0_0_20px_hsl(24_100%_50%/0.15)] 
            transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3
            group-hover:bg-primary/30 group-hover:shadow-[0_0_12px_hsl(24_100%_50%/0.3)] transition-all">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display text-sm tracking-wider text-foreground mb-1">{label}</h3>
          <p className="text-xs text-muted-foreground leading-snug">{description}</p>
        </button>
      ))}
    </div>
  );
}

// ─── Conversation Sidebar ────────────────────────────────────────────────────
function ConversationSidebar({
  conversations,
  currentConversationId,
  onSelect,
  onDelete,
  onNewConversation,
  isOpen,
  onToggle,
}: {
  conversations: any[];
  currentConversationId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const isMobile = useIsMobile();

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40" onClick={onToggle} />
      )}
      <aside className={`
        ${isMobile ? 'fixed left-0 top-0 bottom-0 z-50' : 'relative'}
        ${isOpen ? (isMobile ? 'w-72' : 'w-72') : 'w-0'}
        bg-card/95 backdrop-blur-md border-r border-primary/15
        transition-all duration-300 overflow-hidden flex flex-col
        ${isMobile && !isOpen ? 'pointer-events-none' : ''}
      `}>
        {/* Sidebar header */}
        <div className="p-4 border-b border-primary/15 flex items-center justify-between flex-shrink-0">
          <h2 className="font-display text-sm tracking-wider text-primary whitespace-nowrap">CONVERSATIONS</h2>
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 flex-shrink-0">
            <PanelLeftClose className="w-4 h-4" />
          </Button>
        </div>

        {/* New conversation */}
        <div className="p-3 flex-shrink-0">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-primary/30 hover:bg-primary/10 text-sm"
            onClick={onNewConversation}
          >
            <MessageSquarePlus className="w-4 h-4 text-primary" />
            <span className="whitespace-nowrap">New Conversation</span>
          </Button>
        </div>

        {/* Conversation list */}
        <ScrollArea className="flex-1 px-2 pb-4">
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 px-3">No conversations yet. Start one below.</p>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    currentConversationId === conv.id
                      ? 'bg-primary/15 border border-primary/30 shadow-[0_0_10px_hsl(24_100%_50%/0.1)]'
                      : 'hover:bg-muted/50 border border-transparent'
                  }`}
                  onClick={() => onSelect(conv.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title || 'Untitled'}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity flex-shrink-0"
                    onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </aside>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Help() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [selectedMedia, setSelectedMedia] = useState<ChatMedia | null>(null);
  const [messagesWithMedia, setMessagesWithMedia] = useState<Map<string, ChatMedia>>(new Map());
  const [programmeGenerating, setProgrammeGenerating] = useState(false);
  const [mealPlanGenerating, setMealPlanGenerating] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState<GeneratedPlanInfo[]>([]);
  const [editingPlan, setEditingPlan] = useState<GeneratedPlanInfo | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { user } = useAuth();
  const {
    messages, conversations, currentConversationId, isLoading,
    conversationsLoading, sendMessage, loadConversation,
    deleteConversation, startNewConversation,
  } = useHelpChat();

  const { generateProgramme, detectProgrammeRequest, isGenerating } = useAIProgramme();
  const { generateMealPlan, detectMealPlanRequest, isGenerating: isMealPlanGenerating } = useAIMealPlan();
  const { updateProgram } = useTrainingPrograms();
  const { updateMealPlan } = useMealPlans();

  const lastProcessedMsgRef = useRef<string | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detect build tags in completed assistant messages
  useEffect(() => {
    if (isLoading || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'assistant' || lastMsg.id === lastProcessedMsgRef.current) return;
    lastProcessedMsgRef.current = lastMsg.id;

    const content = lastMsg.content;
    const programmeMatch = content.match(/\[BUILD_PROGRAMME\](\{.*\})?/);
    const mealPlanMatch = content.match(/\[BUILD_MEAL_PLAN\](\{.*\})?/);

    if (programmeMatch) {
      // Strip the tag from displayed content
      const cleanContent = content.replace(/\[BUILD_PROGRAMME\](\{.*\})?/, '').trim();
      if (cleanContent !== content) {
        // Content will be cleaned on next render via enrichedMessages
      }
      const chatContext = messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');
      setProgrammeGenerating(true);
      generateProgramme('Build a programme based on our conversation', { chatContext }).then(result => {
        setProgrammeGenerating(false);
        if (result?.savedToHub && result.programId) {
          const planInfo: GeneratedPlanInfo = { type: 'programme', planData: result.program, planId: result.programId, savedToHub: true };
          setGeneratedPlans(prev => [...prev, planInfo]);
          toast({ title: 'Programme Created & Saved!', description: 'Edit it below or view in Power → My Programmes' });
        }
      });
    } else if (mealPlanMatch) {
      const chatContext = messages.slice(-10).map(m => `${m.role}: ${m.content}`).join('\n');
      setMealPlanGenerating(true);
      generateMealPlan('Build a meal plan based on our conversation', 'full_plan', { chatContext }).then(result => {
        setMealPlanGenerating(false);
        if (result?.savedToHub && result.plan && result.planId) {
          const planInfo: GeneratedPlanInfo = { type: 'meal_plan', planData: result.plan, planId: result.planId, savedToHub: true };
          setGeneratedPlans(prev => [...prev, planInfo]);
          toast({ title: 'Meal Plan Created & Saved!', description: 'Edit it below or view in Fuel → My Meal Plans' });
        }
      });
    }
  }, [messages, isLoading]);

  // Context from URL params or sessionStorage
  useEffect(() => {
    const contextParam = searchParams.get('context');
    if (contextParam) {
      setInput(contextParam);
      setSearchParams({});
      return;
    }
    const storedContext = sessionStorage.getItem('coach_context');
    if (storedContext) {
      try {
        const context = JSON.parse(storedContext);
        let prompt = '';
        switch (context.type) {
          case 'session': prompt = `I just finished a workout session${context.name ? ` (${context.name})` : ''}. Can you give me feedback on my performance?`; break;
          case 'programme': prompt = `I'd like to discuss my training programme${context.name ? ` \"${context.name}\"` : ''}. `; break;
          case 'programme_request': prompt = `Build me a bespoke training programme. `; break;
          case 'meal_plan_request': prompt = `Create a meal plan for me. `; break;
          case 'exercise': prompt = `Can you review my technique for ${context.name || 'this exercise'}?`; break;
          case 'progress': prompt = `I'd like you to analyse my training progress and suggest improvements.`; break;
          case 'food_log': prompt = `Can you give me feedback on my nutrition today?`; break;
        }
        if (prompt) setInput(prompt);
      } catch (e) { console.error('Failed to parse coach context:', e); }
      finally { sessionStorage.removeItem('coach_context'); }
    }
  }, [searchParams, setSearchParams]);

  // ─── Handlers (unchanged business logic) ─────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedMedia) || isLoading || isGenerating || isMealPlanGenerating) return;
    if (!user) { setShowAuthModal(true); return; }

    let messageContent = input;
    if (selectedMedia) {
      const mediaContext = selectedMedia.type === 'video'
        ? `[Attached video: ${selectedMedia.name}]`
        : `[Attached image: ${selectedMedia.name}]`;
      messageContent = messageContent ? `${messageContent}\n\n${mediaContext}` : `Please review this ${selectedMedia.type}: ${selectedMedia.name}`;
    }
    const mediaAttachments = selectedMedia ? [{ type: selectedMedia.type, url: selectedMedia.url, name: selectedMedia.name }] : undefined;

    if (selectedMedia) {
      setMessagesWithMedia(prev => new Map(prev).set(`content:${messageContent}`, selectedMedia));
    }
    sendMessage(messageContent, { mediaAttachments });
    setInput(''); setSelectedMedia(null);
  };

  const handleQuickAction = (prompt: string) => {
    if (!user) { setShowAuthModal(true); return; }
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleEditPlan = (plan: GeneratedPlanInfo) => { setEditingPlan(plan); setShowEditModal(true); };
  const handleSaveEditedPlan = async (editedPlanData: any) => {
    if (!editingPlan) return;
    try {
      if (editingPlan.type === 'programme') {
        await updateProgram.mutateAsync({ programId: editingPlan.planId, programData: editedPlanData as GeneratedProgram });
      } else {
        await updateMealPlan.mutateAsync({ id: editingPlan.planId, name: editedPlanData.planName, description: editedPlanData.overview });
      }
      setGeneratedPlans(prev => prev.map(p => p.planId === editingPlan.planId ? { ...p, planData: editedPlanData } : p));
      setShowEditModal(false); setEditingPlan(null);
      toast({ title: 'Plan Updated!', description: 'Your changes have been saved.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save changes. Please try again.', variant: 'destructive' });
    }
  };
  const handleViewInHub = (plan: GeneratedPlanInfo) => { navigate(plan.type === 'programme' ? '/programming' : '/fuel'); };

  const isAnyGenerating = isGenerating || isMealPlanGenerating;
  const enrichedMessages: MessageWithMedia[] = messages.map((msg) => {
    // Strip build tags from assistant messages
    if (msg.role === 'assistant') {
      const cleanContent = msg.content
        .replace(/\[BUILD_PROGRAMME\](\{.*\})?/g, '')
        .replace(/\[BUILD_MEAL_PLAN\](\{.*\})?/g, '')
        .trim();
      return { ...msg, content: cleanContent };
    }
    const mediaEntry = messagesWithMedia.get(`content:${msg.content}`);
    return { ...msg, media: mediaEntry };
  });

  const hasMessages = enrichedMessages.length > 0;

  // Handle textarea auto-resize and Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <SwipeNavigationWrapper>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/" className="flex items-center gap-3">
                <ThemedLogo />
                <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">UNBREAKABLE</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <VoiceSettingsSheet />
              <NavigationDrawer />
            </div>
          </div>
        </header>

        <div className="pt-[72px]">
          <PageNavigation />
        </div>

        {/* Main content area: sidebar + chat */}
        <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          {/* Conversation Sidebar */}
          {user && (
            <ConversationSidebar
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelect={loadConversation}
              onDelete={deleteConversation}
              onNewConversation={startNewConversation}
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
          )}

          {/* Chat Panel */}
          <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Chat panel header bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/30 backdrop-blur-sm flex-shrink-0">
              {user && !sidebarOpen && (
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="h-8 w-8">
                  <PanelLeftOpen className="w-4 h-4" />
                </Button>
              )}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Flame className="w-5 h-5 text-primary flex-shrink-0" />
                <h2 className="font-display text-sm tracking-wider text-foreground truncate">
                  {currentConversationId
                    ? (conversations.find(c => c.id === currentConversationId)?.title || 'CONVERSATION')
                    : 'UNBREAKABLE COACH'}
                </h2>
              </div>
              {currentConversationId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (currentConversationId) {
                      deleteConversation(currentConversationId);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <ProfileButton />
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
              {!hasMessages ? (
                /* ─── Welcome / Empty State ─── */
                <div className="flex flex-col items-center justify-center h-full animate-fade-in">
                  {/* Hero */}
                  <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-6
                      shadow-[0_0_30px_hsl(24_100%_50%/0.2)] neon-pulse">
                      <Flame className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="font-display text-3xl md:text-5xl tracking-wider mb-3">
                      <span className="text-primary neon-glow-subtle">UNBREAKABLE</span>{' '}
                      <span className="text-foreground">COACH</span>
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto text-sm md:text-base leading-relaxed">
                      Your personal coach for training, nutrition, mindset, and beyond.
                      Ask anything — become{' '}
                      <span className="text-primary font-semibold">UNBREAKABLE</span>.
                    </p>
                    <p className="text-primary font-display text-lg tracking-wider mt-4 neon-glow-subtle">
                      #UNBREAKABLECOACHING
                    </p>
                  </div>

                  {/* Quick Action Tiles */}
                  <QuickActionTiles onSelect={handleQuickAction} disabled={isLoading || isAnyGenerating} />
                </div>
              ) : (
                /* ─── Chat Messages ─── */
                <div className="max-w-3xl mx-auto">
                  {enrichedMessages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  {isLoading && enrichedMessages[enrichedMessages.length - 1]?.role === 'user' && !isGenerating && (
                    <div className="flex items-center gap-3 mb-5 animate-fade-in">
                      <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center neon-border-subtle">
                        <Flame className="w-4 h-4 text-primary" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md px-5 py-4 bg-card/60 border border-primary/20 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Coach is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {isGenerating && (
                    <div className="flex items-center gap-3 mb-5 animate-fade-in">
                      <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center neon-border-subtle">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md px-5 py-4 bg-primary/10 border border-primary/30 backdrop-blur-md shadow-[0_0_20px_hsl(24_100%_50%/0.1)]">
                        <span className="text-sm font-medium text-primary">Building your bespoke programme...</span>
                        <p className="text-xs text-muted-foreground mt-1">This takes about 15-20 seconds</p>
                      </div>
                    </div>
                  )}
                  {isMealPlanGenerating && (
                    <div className="flex items-center gap-3 mb-5 animate-fade-in">
                      <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center neon-border-subtle">
                        <UtensilsCrossed className="w-4 h-4 text-primary animate-pulse" />
                      </div>
                      <div className="rounded-2xl rounded-bl-md px-5 py-4 bg-primary/10 border border-primary/30 backdrop-blur-md shadow-[0_0_20px_hsl(24_100%_50%/0.1)]">
                        <span className="text-sm font-medium text-primary">Building your bespoke meal plan...</span>
                        <p className="text-xs text-muted-foreground mt-1">This takes about 15-20 seconds</p>
                      </div>
                    </div>
                  )}
                  {/* Generated Plan Display Cards */}
                  {generatedPlans.length > 0 && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-border/50">
                      {generatedPlans.map((plan) => (
                        <PlanDisplayCard
                          key={plan.planId}
                          planType={plan.type}
                          planData={plan.planData}
                          planId={plan.planId}
                          savedToHub={plan.savedToHub}
                          onEdit={() => handleEditPlan(plan)}
                          onViewInHub={() => handleViewInHub(plan)}
                        />
                      ))}
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* ─── Input Area (pinned bottom) ─── */}
            <div className="flex-shrink-0 border-t border-border/50 bg-card/40 backdrop-blur-md p-4">
              <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                {/* Media preview */}
                {selectedMedia && (
                  <div className="mb-3 p-3 bg-muted/20 rounded-xl border border-border/50">
                    <div className="flex items-center gap-3">
                      {selectedMedia.type === 'image' ? (
                        <img src={selectedMedia.url} alt="Preview" className="w-14 h-14 object-cover rounded-lg" />
                      ) : (
                        <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center">
                          <Video className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{selectedMedia.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedMedia.type === 'video' ? 'Video attached' : 'Image attached'}</p>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedMedia(null)}>Remove</Button>
                    </div>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <ChatMediaUpload
                    onMediaSelect={setSelectedMedia}
                    selectedMedia={selectedMedia}
                    onClearMedia={() => setSelectedMedia(null)}
                    disabled={isLoading || isAnyGenerating}
                  />
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value);
                        // Auto-resize
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask your coach anything..."
                      rows={1}
                      disabled={isLoading || isAnyGenerating}
                      className="w-full resize-none rounded-xl border border-primary/20 bg-background/80 
                        px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground 
                        focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 
                        focus:shadow-[0_0_15px_hsl(24_100%_50%/0.1)]
                        disabled:opacity-50 transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isLoading || isAnyGenerating || (!input.trim() && !selectedMedia)}
                    className="h-11 px-5 rounded-xl"
                  >
                    {isLoading || isAnyGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        {editingPlan && (
          <AIPlanReviewModal
            isOpen={showEditModal}
            onClose={() => { setShowEditModal(false); setEditingPlan(null); }}
            planType={editingPlan.type}
            planData={editingPlan.planData}
            onSave={handleSaveEditedPlan}
            isSaving={updateProgram.isPending || updateMealPlan.isPending}
          />
        )}
      </div>
    </SwipeNavigationWrapper>
  );
}
