import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";

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
                    console.error("Error checking admin role:", error);
                    setIsAdmin(false);
                } else {
                    setIsAdmin(!!data);
                }
            } catch (err) {
                console.error("Error checking admin role:", err);
                if (mounted) setIsAdmin(false);
            }
        };


        const initSession = async () => {
            try {
                // Get the session from Supabase
                const { data: { session: currentSession }, error } = await supabase.auth.getSession();

                if (mounted) {
                    if (error) {
                        // If error (invalid token, etc.), assume logged out
                        console.error("Session verification failed:", error);
                        setSession(null);
                        setUser(null);
                    } else {
                        setSession(currentSession);
                        setUser(currentSession?.user ?? null);
                        if (currentSession?.user) {
                            await checkAdminRole(currentSession.user.id);
                        }
                    }
                }
            } catch (err) {
                console.error("Session init error:", err);
                if (mounted) {
                    setSession(null);
                    setUser(null);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        initSession();

        // Safety timeout: ensure loading state resolves even if initialization hangs
        const safetyTimeout = setTimeout(() => {
            if (mounted) {
                console.warn("Auth initialization timeout - forcing loading to false");
                // SAFETY: If we timed out, assume we are NOT authenticated to prevent showing
                // "already signed in" state with no data.
                setUser(null);
                setLoading(false);
            }
        }, 5000);

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
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setUser(null);
            setIsAdmin(false);
            // Clear all React Query cache to prevent stale data from persisting
            queryClient.clear();
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, isAdmin, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
