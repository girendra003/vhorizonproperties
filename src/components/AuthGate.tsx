import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";

export function AuthGate({ children }: { children: React.ReactNode }) {
    const { loading } = useAuth();
    const location = useLocation();

    // List of public routes that should not be blocked by auth loading
    const PUBLIC_PATHS = ['/', '/buy', '/rent', '/stays', '/auth/callback', '/login', '/team', '/about', '/contact', '/privacy-policy', '/terms-of-service'];

    // Check if current path is public (including dynamic property pages)
    const isPublicPath = PUBLIC_PATHS.includes(location.pathname) ||
        location.pathname.startsWith('/property/');

    // Only block execution for protected routes when auth is loading
    // This allows public pages to load immediately without waiting for auth check (which can timeout)
    if (loading && !isPublicPath) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
