import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Calculators from "./pages/Calculators";
import Tracker from "./pages/Tracker";
import Mindset from "./pages/Mindset";
import MindsetBreathing from "./pages/MindsetBreathing";
import MindsetGames from "./pages/MindsetGames";
import Programming from "./pages/Programming";
import Fuel from "./pages/Fuel";
import Help from "./pages/Help";
import Inbox from "./pages/Inbox";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import University from "./pages/University";

// New modular sub-pages
import Profile from "./pages/Profile";
import ProgrammingLogs from "./pages/ProgrammingLogs";
import ProgrammingMyProgrammes from "./pages/ProgrammingMyProgrammes";
import ProgrammingCreate from "./pages/ProgrammingCreate";
import FuelHistory from "./pages/FuelHistory";
import FuelRecipes from "./pages/FuelRecipes";
import FuelPlanning from "./pages/FuelPlanning";
import FuelFoods from "./pages/FuelFoods";
import FuelMyFuel from "./pages/FuelMyFuel";
import TrackerQuickTrack from "./pages/TrackerQuickTrack";
import TrackerMyProgrammes from "./pages/TrackerMyProgrammes";
import TrackerCreate from "./pages/TrackerCreate";
import UserProfile from "./pages/UserProfile";
import Onboarding from "./pages/Onboarding";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <div className="brick-texture min-h-screen">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Index handles both logged-in hub and logged-out landing */}
              <Route path="/" element={<Index />} />
              
              {/* Onboarding wizard - mandatory for new users */}
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Profile - dedicated page */}
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
              
              {/* Calculators */}
              <Route path="/calculators" element={
                <ProtectedRoute><Calculators /></ProtectedRoute>
              } />
              
              {/* Programming (Power) routes */}
              <Route path="/programming" element={
                <ProtectedRoute><Programming /></ProtectedRoute>
              } />
              <Route path="/programming/create" element={
                <ProtectedRoute><ProgrammingCreate /></ProtectedRoute>
              } />
              <Route path="/programming/my-programmes" element={
                <ProtectedRoute><ProgrammingMyProgrammes /></ProtectedRoute>
              } />
              <Route path="/programming/logs" element={
                <ProtectedRoute><ProgrammingLogs /></ProtectedRoute>
              } />
              
              {/* Tracker (Movement) routes */}
              <Route path="/tracker" element={
                <ProtectedRoute><Tracker /></ProtectedRoute>
              } />
              <Route path="/tracker/create" element={
                <ProtectedRoute><TrackerCreate /></ProtectedRoute>
              } />
              <Route path="/tracker/my-programmes" element={
                <ProtectedRoute><TrackerMyProgrammes /></ProtectedRoute>
              } />
              
              {/* Fuel routes */}
              <Route path="/fuel" element={
                <ProtectedRoute><Fuel /></ProtectedRoute>
              } />
              <Route path="/fuel/history" element={
                <ProtectedRoute><FuelHistory /></ProtectedRoute>
              } />
              <Route path="/fuel/recipes" element={
                <ProtectedRoute><FuelRecipes /></ProtectedRoute>
              } />
              <Route path="/fuel/planning" element={
                <ProtectedRoute><FuelPlanning /></ProtectedRoute>
              } />
              <Route path="/fuel/foods" element={
                <ProtectedRoute><FuelFoods /></ProtectedRoute>
              } />
              <Route path="/fuel/my-fuel" element={
                <ProtectedRoute><FuelMyFuel /></ProtectedRoute>
              } />
              
              {/* Mindset routes */}
              <Route path="/mindset" element={
                <ProtectedRoute><Mindset /></ProtectedRoute>
              } />
              <Route path="/mindset/breathing" element={
                <ProtectedRoute><MindsetBreathing /></ProtectedRoute>
              } />
              <Route path="/mindset/games" element={
                <ProtectedRoute><MindsetGames /></ProtectedRoute>
              } />
              
              {/* Coaching (Help) */}
              <Route path="/help" element={
                <ProtectedRoute><Help /></ProtectedRoute>
              } />
              
              {/* University */}
              <Route path="/university" element={
                <ProtectedRoute><University /></ProtectedRoute>
              } />
              
              {/* Inbox */}
              <Route path="/inbox" element={
                <ProtectedRoute><Inbox /></ProtectedRoute>
              } />
              
              {/* User Profile - Public profile viewing */}
              <Route path="/user/:userId" element={<UserProfile />} />
              
              {/* Admin Dashboard - Hidden, role-protected */}
              <Route path="/admin" element={<Admin />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
