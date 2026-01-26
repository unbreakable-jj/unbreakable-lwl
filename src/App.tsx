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
import Programming from "./pages/Programming";
import Fuel from "./pages/Fuel";
import Help from "./pages/Help";
import Inbox from "./pages/Inbox";
import NotFound from "./pages/NotFound";

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
              
              {/* Protected Routes - require authentication */}
              <Route path="/calculators" element={
                <ProtectedRoute><Calculators /></ProtectedRoute>
              } />
              <Route path="/tracker" element={
                <ProtectedRoute><Tracker /></ProtectedRoute>
              } />
              <Route path="/fuel" element={
                <ProtectedRoute><Fuel /></ProtectedRoute>
              } />
              <Route path="/mindset" element={
                <ProtectedRoute><Mindset /></ProtectedRoute>
              } />
              <Route path="/programming" element={
                <ProtectedRoute><Programming /></ProtectedRoute>
              } />
              <Route path="/help" element={
                <ProtectedRoute><Help /></ProtectedRoute>
              } />
              <Route path="/inbox" element={
                <ProtectedRoute><Inbox /></ProtectedRoute>
              } />
              
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
