import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { rateLimiter, RateLimitConfigs } from "@/lib/rateLimit";
import { sanitizeEmail } from "@/lib/sanitize";

export default function UserLoginPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth(); // We don't check isAdmin here, handled by redirect
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("signin");

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            navigate("/dashboard");
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Rate limiting check
        const rateLimitKey = `login:${email.toLowerCase()}`;
        if (!rateLimiter.check(rateLimitKey, RateLimitConfigs.login)) {
            const resetTime = rateLimiter.getResetTime(rateLimitKey);
            toast.error(`Too many login attempts. Please try again in ${Math.ceil(resetTime / 60)} minutes.`);
            return;
        }

        setLoading(true);

        try {
            // Sanitize email
            const sanitizedEmail = sanitizeEmail(email);

            if (activeTab === "signup") {
                const { error } = await supabase.auth.signUp({
                    email: sanitizedEmail,
                    password,
                });
                if (error) throw error;
                toast.success("Account created! You can now sign in.");
                setActiveTab("signin");
                // Clear rate limit on successful signup
                rateLimiter.clear(rateLimitKey);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: sanitizedEmail,
                    password,
                });
                if (error) throw error;
                toast.success("Welcome back!");
                // Clear rate limit on successful login
                rateLimiter.clear(rateLimitKey);
                // Navigation handled by useEffect
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Authentication failed";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            console.log("[GoogleLogin] Redirecting to:", `${window.location.origin}/auth/callback`);
            if (error) throw error;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Google";
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-zinc-900 text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-27b88e31e640?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>

                <div className="relative z-10">
                    <Link to="/" className="text-2xl font-bold tracking-tight">VHorizon.</Link>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h2 className="text-4xl font-bold mb-6">Discover your dream property today.</h2>
                    <p className="text-zinc-300 text-lg leading-relaxed">
                        Join thousands of homeowners and investors finding the perfect match with our AI-powered property insights.
                    </p>
                </div>

                <div className="relative z-10 text-sm text-zinc-500">
                    © 2024 VHorizon Properties. All rights reserved.
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-[400px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            {activeTab === "signin" ? "Welcome back" : "Create an account"}
                        </h1>
                        <p className="text-muted-foreground">
                            {activeTab === "signin"
                                ? "Enter your credentials to access your account"
                                : "Enter your details to get started"}
                        </p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="signin">Sign In</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>

                        <div className="space-y-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        {activeTab === "signin" && (
                                            <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-11 pr-10"
                                            required
                                            minLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-11 font-medium" disabled={loading}>
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : activeTab === "signin" ? (
                                        <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
                                    ) : (
                                        <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
                                    )}
                                </Button>
                            </form>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                type="button"
                                className="w-full h-11 font-medium" // consistent height
                                disabled={loading}
                                onClick={handleGoogleLogin}
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                    </svg>
                                )}
                                Sign in with Google
                            </Button>
                        </div>
                    </Tabs>

                    <p className="text-center text-sm text-muted-foreground">
                        <Link to="/" className="hover:text-foreground transition-colors">
                            ← Back to Home
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
