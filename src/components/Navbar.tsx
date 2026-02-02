import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Heart, LogIn, LogOut, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import FavoritesDrawer from "./FavoritesDrawer";
import logo from "@/assets/logo.png";

const navLinks = [
  { href: "/", label: "Explore" },
  { href: "/buy", label: "Buy" },
  { href: "/rent", label: "Lease" }, // Route stays /rent to minimize refactor, visual label is Lease
  { href: "/stays", label: "Stays" },
  { href: "/team", label: "Our Team" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  const { favorites } = useFavorites();
  const { user, signOut, isAdmin, loading } = useAuth();

  // Get user display name
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Profile";

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    // Use window.location.replace for a complete page reload and history replacement
    window.location.replace("/");
  };

  return (
    <>
      <nav className="fixed top-0 w-full h-20 bg-card/95 backdrop-blur-md z-50 border-b border-border">
        <div className="container h-full flex items-center justify-between">
          <Link to="/" onClick={handleLogoClick} className="flex items-center">
            <img src={logo} alt="V Horizon Properties" className="h-10 sm:h-12 lg:h-14 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium uppercase tracking-wide transition-colors hover:text-primary relative ${location.pathname === link.href
                  ? "text-primary after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-primary"
                  : "text-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-2 border-l pl-6 ml-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-2"
                onClick={() => setFavOpen(true)}
              >
                <Heart className="h-4 w-4" />
                <span>{favorites.length}</span>
              </Button>

              {loading ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full gap-2"
                  disabled
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                </Button>
              ) : user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full gap-2"
                    onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}
                  >
                    <User className="h-4 w-4" />
                    <span className="sr-only lg:not-sr-only lg:inline-block max-w-[150px] truncate">
                      {displayName}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full gap-2"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only lg:not-sr-only lg:inline-block">Sign Out</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-full gap-2"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => setFavOpen(true)}
            >
              <Heart className="h-4 w-4" />
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-6 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`text-lg font-medium ${location.pathname === link.href
                        ? "text-primary"
                        : "text-foreground"
                        }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="h-px bg-border my-2" />

                  {loading ? (
                    <div className="flex items-center gap-2 text-lg font-medium text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading...
                    </div>
                  ) : user ? (
                    <>
                      <Link
                        to={isAdmin ? "/admin" : "/dashboard"}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 text-lg font-medium"
                      >
                        <User className="h-5 w-5" />
                        <span className="truncate max-w-[200px]">{displayName}</span>
                      </Link>
                      <button
                        onClick={() => {
                          setMobileOpen(false);
                          handleSignOut();
                        }}
                        className="flex items-center gap-2 text-lg font-medium text-left text-destructive"
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-lg font-medium text-primary"
                    >
                      <LogIn className="h-5 w-5" />
                      Sign In
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      <FavoritesDrawer open={favOpen} onOpenChange={setFavOpen} />
    </>
  );
}
