import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";
import { debugLog } from "@/lib/debug";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    isAdmin: false,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
    children: React.ReactNode;
    queryClient: QueryClient;
}

export function AuthProvider({ children, queryClient }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);


    useEffect(() => {
        let mounted = true;

        const checkAdminRole = async (userId: string) => {
            try {
                const { data, error } = await supabase
                    .from("user_roles")
                    .select("role")
                    .eq("user_id", userId)
                    .eq("role", "admin")
                    .maybeSingle();

                if (!mounted) return;

                if (error) {
                    debugLog.authError("Error checking admin role", error);
                    setIsAdmin(false);
                } else {
                    setIsAdmin(!!data);
                }
            } catch (err) {
                debugLog.authError("Error checking admin role", err);
                if (mounted) setIsAdmin(false);
            }
        };


        const initSession = async () => {
            debugLog.auth("initSession started");

            // Skip initial session check if we're on the auth callback path
            if (window.location.pathname.includes("/auth/callback")) {
                debugLog.auth("Skipping initSession on auth callback route");
                if (mounted) setLoading(false);
                return;
            }

            try {
                // FAST PATH: Try to get session with a short timeout (2s)
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Supabase getSession timeout')), 2000)
                );

                const sessionPromise = supabase.auth.getSession();

                // Race!
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result = await Promise.race([sessionPromise, timeoutPromise]) as any;

                if (mounted) {
                    const session = result.data?.session;
                    if (session) {
                        debugLog.auth("Got session via global client");
                        setSession(session);
                        setUser(session.user);
                        checkAdminRole(session.user.id);
                    } else {
                        // Explicitly no session
                        setSession(null);
                        setUser(null);
                    }
                }
            } catch (err) {
                // SLOW PATH / FALLBACK
                // If global client hangs/fails, try reading from LocalStorage
                console.warn("Global auth init timed out, checking LocalStorage fallback...");

                try {
                    const projectRef = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0];
                    if (projectRef) {
                        const storageKey = `sb-${projectRef}-auth-token`;
                        const storedSession = localStorage.getItem(storageKey);
                        if (storedSession && mounted) {
                            const parsed = JSON.parse(storedSession);
                            // Verify it looks like a session
                            if (parsed.access_token && parsed.user) {
                                debugLog.auth("Recovered session from LocalStorage");
                                setSession(parsed); // It matches the shape enough
                                setUser(parsed.user);
                                // Don't check admin role here to avoid another hang, do it lazily or assume false
                            }
                        }
                    }
                } catch (stErr) {
                    console.error("Failed to parse local session", stErr);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        debugLog.auth("Calling initSession");
        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, currentSession) => {
                if (!mounted) return;

                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    // Check admin role again on auth state change (like sign in)
                    await checkAdminRole(currentSession.user.id);
                } else {
                    setIsAdmin(false);
                }
                setLoading(false);

                // Refetch all queries when user signs in
                if (event === "SIGNED_IN") {
                    queryClient.invalidateQueries();
                }

                // Clear all cached data when user signs out
                if (event === "SIGNED_OUT") {
                    queryClient.clear();
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [queryClient]);

    const signOut = async () => {
        try {
            debugLog.auth("Sign Out requested");

            // 1. Try to sign out from server with a short timeout
            // If the global client is hung, this would otherwise block forever
            const signOutPromise = supabase.auth.signOut();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Sign out timed out")), 2000)
            );

            await Promise.race([signOutPromise, timeoutPromise]);
            debugLog.auth("Sign Out successful on server");
        } catch (error) {
            debugLog.authError("Error signing out (or timed out), forcing local cleanup", error);

            // 2. Force clear local storage if server signout failed/timed out
            // This ensures the user is effectively logged out locally
            try {
                const projectRef = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0];
                if (projectRef) {
                    const storageKey = `sb-${projectRef}-auth-token`;
                    localStorage.removeItem(storageKey);
                    debugLog.auth("Forced removal of local session token");
                }
            } catch (cleanupError) {
                console.error("Failed to force clean local storage", cleanupError);
            }
        } finally {
            // 3. Always clear React state and Query cache
            setUser(null);
            setSession(null);
            setIsAdmin(false);
            queryClient.clear();
            debugLog.auth("Local state cleared");
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, isAdmin, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
