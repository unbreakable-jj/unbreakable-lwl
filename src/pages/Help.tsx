import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Send, MessageSquarePlus, History, Trash2, ChevronDown, ChevronUp, Loader2, Flame, Sparkles, Video, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { ExampleQuestions } from '@/components/coaching/ExampleQuestions';
import { ProfileButton } from '@/components/coaching/ProfileButton';
import { PlanDisplayCard } from '@/components/coaching/PlanDisplayCard';
import { AIPlanReviewModal } from '@/components/ai/AIPlanReviewModal';
import { useAIProgramme } from '@/hooks/useAIProgramme';
import { useAIMealPlan } from '@/hooks/useAIMealPlan';
import { useTrainingPrograms } from '@/hooks/useTrainingPrograms';
import { useMealPlans } from '@/hooks/useMealPlans';
import { toast } from '@/hooks/use-toast';
import { GeneratedProgram } from '@/lib/programTypes';

interface MessageWithMedia extends Message {
  media?: ChatMedia;
}

// Store generated plans for display
interface GeneratedPlanInfo {
  type: 'programme' | 'meal_plan';
  planData: any;
  planId: string;
  savedToHub: boolean;
  messageId?: string;
}

function MessageBubble({ message }: { message: MessageWithMedia }) {
  const isUser = message.role === 'user';
  
  // Simple markdown parsing for bold and numbered lists
  const formatContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Split by bold markers and render safely with React JSX (no dangerouslySetInnerHTML)
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [input, setInput] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<ChatMedia | null>(null);
  const [messagesWithMedia, setMessagesWithMedia] = useState<Map<string, ChatMedia>>(new Map());
  const [programmeGenerating, setProgrammeGenerating] = useState(false);
  const [mealPlanGenerating, setMealPlanGenerating] = useState(false);
  
  // Plan editing state
  const [generatedPlans, setGeneratedPlans] = useState<GeneratedPlanInfo[]>([]);
  const [editingPlan, setEditingPlan] = useState<GeneratedPlanInfo | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
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
  const { generateMealPlan, detectMealPlanRequest, isGenerating: isMealPlanGenerating } = useAIMealPlan();
  const { updateProgram } = useTrainingPrograms();
  const { updateMealPlan } = useMealPlans();

  // Check for context from URL params or sessionStorage
  useEffect(() => {
    // First check URL params (from AI Build Banners)
    const contextParam = searchParams.get('context');
    if (contextParam) {
      setInput(contextParam);
      // Clear the param from URL
      setSearchParams({});
      return;
    }

    // Then check sessionStorage (from in-app CTAs)
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
          case 'meal_plan_request':
            prompt = `Create a meal plan for me. `;
            break;
          case 'exercise':
            prompt = `Can you review my technique for ${context.name || 'this exercise'}?`;
            break;
          case 'progress':
            prompt = `I'd like you to analyse my training progress and suggest improvements.`;
            break;
          case 'food_log':
            prompt = `Can you give me feedback on my nutrition today?`;
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
  }, [searchParams, setSearchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedMedia) || isLoading || isGenerating || isMealPlanGenerating) return;
    
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
    
    // Prepare media attachments for the coach
    const mediaAttachments = selectedMedia ? [{
      type: selectedMedia.type,
      url: selectedMedia.url,
      name: selectedMedia.name,
    }] : undefined;
    
    // Check if this is a programme request
    if (detectProgrammeRequest(messageContent)) {
      setProgrammeGenerating(true);
      
      // Add user message to chat first
      const userMsg = messageContent;
      sendMessage(userMsg, { mediaAttachments });
      setInput('');
      setSelectedMedia(null);
      
      // Generate programme
      const result = await generateProgramme(userMsg, {
        chatContext: messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n'),
      });
      
      setProgrammeGenerating(false);
      
      if (result?.savedToHub && result.programId) {
        // Store the generated plan for display as a clean card
        const planInfo: GeneratedPlanInfo = {
          type: 'programme',
          planData: result.program,
          planId: result.programId,
          savedToHub: true,
        };
        setGeneratedPlans(prev => [...prev, planInfo]);
        
        // Add brief assistant acknowledgment (plan details shown in card)
        setTimeout(() => {
          sendMessage(`🎉 **"${result.program.programName}"** is ready! Check out the full details below.`);
        }, 300);
        
        toast({
          title: 'Programme Created & Saved!',
          description: 'Edit it below or view in Power → My Programmes',
        });
      }
      return;
    }

    // Check if this is a meal plan request
    if (detectMealPlanRequest(messageContent)) {
      setMealPlanGenerating(true);
      
      // Add user message to chat first
      const userMsg = messageContent;
      sendMessage(userMsg, { mediaAttachments });
      setInput('');
      setSelectedMedia(null);
      
      // Generate meal plan
      const result = await generateMealPlan(userMsg, 'full_plan', {
        chatContext: messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n'),
      });
      
      setMealPlanGenerating(false);
      
      if (result?.savedToHub && result.plan && result.planId) {
        // Store the generated plan for display as a clean card
        const planInfo: GeneratedPlanInfo = {
          type: 'meal_plan',
          planData: result.plan,
          planId: result.planId,
          savedToHub: true,
        };
        setGeneratedPlans(prev => [...prev, planInfo]);
        
        // Add brief assistant acknowledgment (plan details shown in card)
        setTimeout(() => {
          sendMessage(`🍽️ **"${result.plan.planName}"** is ready! Check out the full details below.`);
        }, 300);
        
        toast({
          title: 'Meal Plan Created & Saved!',
          description: 'Edit it below or view in Fuel → My Meal Plans',
        });
      }
      return;
    }
    
    // Store media reference for the message we're about to send
    if (selectedMedia) {
      const tempId = `temp_${Date.now()}`;
      setMessagesWithMedia(prev => new Map(prev).set(tempId, selectedMedia));
    }
    
    // Send message with media attachments and user context
    sendMessage(messageContent, { mediaAttachments });
    setInput('');
    setSelectedMedia(null);
  };

  const handleExampleQuestion = (question: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setInput(question);
  };

  // Handle edit plan
  const handleEditPlan = (plan: GeneratedPlanInfo) => {
    setEditingPlan(plan);
    setShowEditModal(true);
  };

  // Handle save edited plan
  const handleSaveEditedPlan = async (editedPlanData: any) => {
    if (!editingPlan) return;
    
    try {
      if (editingPlan.type === 'programme') {
        await updateProgram.mutateAsync({
          programId: editingPlan.planId,
          programData: editedPlanData as GeneratedProgram,
        });
      } else {
        await updateMealPlan.mutateAsync({
          id: editingPlan.planId,
          name: editedPlanData.planName,
          description: editedPlanData.overview,
        });
      }
      
      // Update local state
      setGeneratedPlans(prev => prev.map(p => 
        p.planId === editingPlan.planId 
          ? { ...p, planData: editedPlanData }
          : p
      ));
      
      setShowEditModal(false);
      setEditingPlan(null);
      
      toast({
        title: 'Plan Updated!',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handle view in hub
  const handleViewInHub = (plan: GeneratedPlanInfo) => {
    if (plan.type === 'programme') {
      navigate('/programming');
    } else {
      navigate('/fuel');
    }
  };

  const isAnyGenerating = isGenerating || isMealPlanGenerating;

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
        {/* Header with Theme Toggle */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/" className="flex items-center gap-3">
                <ThemedLogo />
                <span className="font-display text-lg tracking-wide text-foreground hidden sm:block">
                  UNBREAKABLE
                </span>
              </Link>
            </div>
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
            <span className="text-primary neon-glow-subtle">UNBREAKABLE </span>
            <span className="text-foreground">COACHING</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mt-4">
            Your personal coach for training, nutrition, mindset, and beyond.
            Ask anything — become{' '}
            <span className="text-primary font-semibold">UNBREAKABLE</span>. Keep showing up.
          </p>
          <p className="text-primary font-display text-xl tracking-wider mt-4 neon-glow-subtle">
            #UNBREAKABLECOACHING
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
                  {isMealPlanGenerating && (
                    <div className="flex justify-start mb-4">
                      <Card className="bg-primary/10 border-primary/30 neon-border-subtle">
                        <CardContent className="p-4 flex items-center gap-3">
                          <UtensilsCrossed className="w-5 h-5 text-primary animate-pulse" />
                          <div>
                            <span className="text-sm font-medium text-primary">Building your bespoke meal plan...</span>
                            <p className="text-xs text-muted-foreground mt-1">This takes about 15-20 seconds</p>
                          </div>
                        </CardContent>
                      </Card>
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
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Standalone Plan Display - shown when plans exist but no messages */}
          {generatedPlans.length > 0 && enrichedMessages.length === 0 && (
            <div className="mb-6 space-y-4">
              <h3 className="font-display text-lg tracking-wide text-center text-muted-foreground">
                YOUR GENERATED PLANS
              </h3>
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
          <form onSubmit={handleSubmit} className="space-y-4">
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
                disabled={isLoading || isAnyGenerating}
              />
              
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your coach anything — training, nutrition, motivation..."
                className="flex-1"
                disabled={isLoading || isAnyGenerating}
              />
              <Button type="submit" disabled={isLoading || isAnyGenerating || (!input.trim() && !selectedMedia)}>
                {isLoading || isAnyGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Ask Coach
                  </>
                )}
              </Button>
            </div>

            {/* Example Questions - Always visible below input */}
            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-3 text-center">
                {enrichedMessages.length === 0 ? 'Try asking your coach:' : 'Quick prompts:'}
              </p>
              <ExampleQuestions 
                onQuestionClick={handleExampleQuestion}
                disabled={isLoading || isAnyGenerating}
              />
            </div>
          </form>

          {/* Ask Another Question hint + Profile Button */}
          {enrichedMessages.length > 0 && !isLoading && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Type another question above or{' '}
                <button 
                  className="text-primary hover:underline"
                  onClick={startNewConversation}
                >
                  start a new conversation
                </button>
              </p>
              <ProfileButton />
            </div>
          )}

          {/* Profile Button when no messages */}
          {enrichedMessages.length === 0 && user && (
            <div className="flex justify-center mt-6 pt-4 border-t border-border">
              <ProfileButton />
            </div>
          )}
        </div>
      </main>

        <UnifiedFooter />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        
        {/* Plan Edit Modal */}
        {editingPlan && (
          <AIPlanReviewModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingPlan(null);
            }}
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
