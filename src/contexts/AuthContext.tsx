import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
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
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (mounted) {
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        await checkAdminRole(session.user.id);
                    }
                }
            } catch (err) {
                console.error("Session init error:", err);
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
                setLoading(false);
            }
        }, 5000);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (!mounted) return;

                setUser(session?.user ?? null);
                if (session?.user) {
                    // Check admin role again on auth state change (like sign in)
                    await checkAdminRole(session.user.id);
                } else {
                    setIsAdmin(false);
                }
                setLoading(false);
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
        <AuthContext.Provider value={{ user, loading, isAdmin, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
