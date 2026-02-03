import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { debugLog } from "@/lib/debug";

declare global {
    interface Window {
        _auth_processing?: boolean;
    }
}

export default function AuthCallback() {
    const navigate = useNavigate();
    // Use a ref to track the timer ID so we can clear it reliably
    const [timeoutReached, setTimeoutReached] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // Global guard to prevent double-execution in Strict Mode
        if (window._auth_processing) {
            console.log("[AuthCallback] Auth already processing, skipping duplicate execution");
            return;
        }
        window._auth_processing = true;

        let mounted = true;

        const handleAuthCallback = async () => {
            try {
                debugLog.auth("Starting authentication callback processing...");
                debugLog.auth("URL", window.location.href);

                // Check for error parameters in the URL (hash or search)
                const params = new URLSearchParams(window.location.hash.substring(1)); // For implicit flow
                const queryParams = new URLSearchParams(window.location.search); // For PKCE flow

                const error = params.get('error') || queryParams.get('error');
                const errorDescription = params.get('error_description') || queryParams.get('error_description');

                debugLog.auth("URL params check", { error, errorDescription });

                if (error) {
                    debugLog.authError("Auth callback error", { error, errorDescription });
                    toast.error(`Authentication failed: ${errorDescription || error}`);
                    if (mounted) navigate("/login", { replace: true });
                    return;
                }

                // Explicitly check for 'code' param for PKCE flow
                const code = queryParams.get('code');

                let sessionData;
                let sessionError;

                if (code) {
                    debugLog.auth("Auth code detected, exchanging for session...");

                    // WORKAROUND: Use fresh client for exchange to avoid global client hang
                    // This is critical because if the global client state is locked, exchange fails
                    const { createClient } = await import("@supabase/supabase-js");
                    const freshClient = createClient(
                        import.meta.env.VITE_SUPABASE_URL,
                        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                        { auth: { persistSession: true, detectSessionInUrl: false } }
                    );

                    const exchangeResult = await freshClient.auth.exchangeCodeForSession(code);
                    sessionData = exchangeResult.data;
                    sessionError = exchangeResult.error;

                    // If successful, we need to sync this to the global client eventually
                    // But for now, just having it in localStorage (via freshClient default) is enough
                    // for the AuthContext fallback to pick it up!
                    if (sessionData.session) {
                        // NON-BLOCKING: Don't await this because global client might be stuck!
                        // We just want to trigger the state change if possible.
                        // The 'freshClient' has already written to localStorage, so we are safe.
                        supabase.auth.setSession(sessionData.session).catch(err => {
                            debugLog.warn("Non-blocking global session sync failed (ignorable)", err);
                        });
                    }
                } else {
                    debugLog.auth("No code param, checking for existing session...");
                    const sessionResult = await supabase.auth.getSession();
                    sessionData = sessionResult.data;
                    sessionError = sessionResult.error;
                }

                const startTime = Date.now();
                const elapsed = Date.now() - startTime;
                debugLog.auth(`Session retrieval/exchange took ${elapsed}ms`);

                if (sessionError) {
                    debugLog.authError("Session exchange/retrieval error", sessionError);
                    toast.error(`Auth Error: ${sessionError.message}`);
                    if (mounted) navigate("/login", { replace: true });
                    return;
                }

                const session = sessionData.session;

                if (!session) {
                    debugLog.warn("No session found after callback");
                    toast.error("No session established. Please sign in again.");
                    if (mounted) navigate("/login", { replace: true });
                    return;
                }

                // Successful session establishment
                debugLog.auth("Session established successfully for user", session.user.email);
                debugLog.auth("Redirecting to dashboard...");

                // Clear the timeout immediately on success
                if (timeoutRef.current) clearTimeout(timeoutRef.current);

                toast.success("Signed in successfully!");
                if (mounted) navigate("/dashboard", { replace: true });
            } catch (err) {
                debugLog.authError("Unexpected error handling auth callback", err);
                toast.error("An unexpected error occurred. Please try again.");
                if (mounted) navigate("/login", { replace: true });
            }
        };

        // Set a timeout to prevent infinite loading (increased to 15 seconds for slower connections)
        timeoutRef.current = setTimeout(() => {
            if (mounted) {
                debugLog.authError("Authentication timeout reached (15s)");
                setTimeoutReached(true);
                toast.error("Authentication is taking too long. Please check your connection and try again.");
                navigate("/login", { replace: true });
            }
        }, 15000); // 15 second timeout

        handleAuthCallback();

        return () => {
            mounted = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
