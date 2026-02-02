import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallback() {
    const navigate = useNavigate();
    const [timeoutReached, setTimeoutReached] = useState(false);

    useEffect(() => {
        let mounted = true;
        let timeoutId: NodeJS.Timeout;

        const handleAuthCallback = async () => {
            try {
                console.log("[AuthCallback] Starting authentication callback processing...");

                // Check for error parameters in the URL (hash or search)
                const params = new URLSearchParams(window.location.hash.substring(1)); // For implicit flow
                const queryParams = new URLSearchParams(window.location.search); // For PKCE flow

                const error = params.get('error') || queryParams.get('error');
                const errorDescription = params.get('error_description') || queryParams.get('error_description');

                if (error) {
                    console.error("[AuthCallback] Auth callback error:", error, errorDescription);
                    toast.error(`Authentication failed: ${errorDescription || error}`);
                    if (mounted) navigate("/login", { replace: true });
                    return;
                }

                // v2: getSession() handles URL parsing for both implicit and PKCE flows automatically
                console.log("[AuthCallback] Retrieving session...");
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error("[AuthCallback] Session retrieval error:", sessionError);
                    toast.error("Failed to establish session. Please try again.");
                    if (mounted) navigate("/login", { replace: true });
                    return;
                }

                if (!session) {
                    console.warn("[AuthCallback] No session found after callback");
                    toast.error("No session established. Please sign in again.");
                    if (mounted) navigate("/login", { replace: true });
                    return;
                }

                // Successful session establishment
                console.log("[AuthCallback] Session established successfully, redirecting to dashboard");
                toast.success("Signed in successfully!");
                if (mounted) navigate("/dashboard", { replace: true });
            } catch (err) {
                console.error("[AuthCallback] Unexpected error handling auth callback:", err);
                toast.error("An unexpected error occurred. Please try again.");
                if (mounted) navigate("/login", { replace: true });
            }
        };

        // Set a timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
            if (mounted) {
                console.error("[AuthCallback] Authentication timeout reached");
                setTimeoutReached(true);
                toast.error("Authentication is taking too long. Please try again.");
                navigate("/login", { replace: true });
            }
        }, 5000); // 5 second timeout

        handleAuthCallback();

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
        };
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                <div className="space-y-2">
                    <h2 className="text-xl font-semibold">
                        {timeoutReached ? "Authentication Timeout" : "Signing you in..."}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {timeoutReached
                            ? "Redirecting you back to login..."
                            : "Please wait while we complete your sign-in"}
                    </p>
                </div>
            </div>
        </div>
    );
}
