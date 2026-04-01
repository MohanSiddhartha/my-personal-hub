import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Notes from "./pages/Notes";
import Snippets from "./pages/Snippets";
import Portfolio from "./pages/Portfolio";
import Quiz from "./pages/Quiz";
import AiHelper from "./pages/AiHelper";
import FileLocker from "./pages/FileLocker";
import Articles from "./pages/Articles";
import Markets from "./pages/Markets";
import Facts from "./pages/Facts";
import InterviewPrep from "./pages/InterviewPrep";
import Jobs from "./pages/Jobs";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-2 h-2 rounded-full bg-primary" style={{ animation: "breathe 1.5s ease-in-out infinite" }} />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
            <Route path="/" element={<ProtectedRoute><AppLayout><Index /></AppLayout></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><AppLayout><Notes /></AppLayout></ProtectedRoute>} />
            <Route path="/snippets" element={<ProtectedRoute><AppLayout><Snippets /></AppLayout></ProtectedRoute>} />
            <Route path="/portfolio" element={<ProtectedRoute><AppLayout><Portfolio /></AppLayout></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><AppLayout><Quiz /></AppLayout></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><AppLayout><AiHelper /></AppLayout></ProtectedRoute>} />
            <Route path="/files" element={<ProtectedRoute><AppLayout><FileLocker /></AppLayout></ProtectedRoute>} />
            <Route path="/articles" element={<ProtectedRoute><AppLayout><Articles /></AppLayout></ProtectedRoute>} />
            <Route path="/markets" element={<ProtectedRoute><AppLayout><Markets /></AppLayout></ProtectedRoute>} />
            <Route path="/facts" element={<ProtectedRoute><AppLayout><Facts /></AppLayout></ProtectedRoute>} />
            <Route path="/interview" element={<ProtectedRoute><AppLayout><InterviewPrep /></AppLayout></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><AppLayout><Jobs /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;