import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";

export function AuthGate({ children }: { children: React.ReactNode }) {
    const { loading } = useAuth();
    const location = useLocation();

    // Bypass global loading state for auth callback page to let it handle its own UI/logic
    if (loading && location.pathname !== "/auth/callback") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
