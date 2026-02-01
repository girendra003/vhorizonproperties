import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGate } from "@/components/AuthGate";

// Eager load critical pages
import Index from "./pages/Index";
import ListingsPage from "./pages/ListingsPage";

// Lazy load less critical pages
const PropertyDetailPage = lazy(() => import("./pages/PropertyDetailPage"));
const TeamPage = lazy(() => import("./pages/TeamPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const StaysPage = lazy(() => import("./pages/StaysPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Retry up to 2 times for network errors during auth restoration
        if (failureCount < 2) return true;
        return false;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
      refetchOnWindowFocus: false, // Prevent excessive refetching
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider queryClient={queryClient}>
        <AuthGate>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/buy" element={<ListingsPage key="buy" defaultStatus="sale" />} />
                <Route path="/rent" element={<ListingsPage key="rent" defaultStatus="rent" />} />
                <Route path="/stays" element={<StaysPage />} />
                <Route path="/property/:id" element={<PropertyDetailPage />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthGate>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
