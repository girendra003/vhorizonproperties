import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Loader2 } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import logo from "@/assets/logo.png";

const emailSchema = z.string().email("Please enter a valid email address");

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim() });

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success("Successfully subscribed to newsletter!");
        setEmail("");
      }
    } catch (err) {
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-black text-white">
      <div className="container py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block -mt-4 sm:-mt-6">
              <div className="bg-white rounded-lg p-2 sm:p-3 inline-block">
                <img src={logo} alt="V Horizon Properties" className="h-12 sm:h-16 w-auto" />
              </div>
            </Link>
            <p className="text-muted-foreground mt-4 text-sm">
              Defining Luxury Real Estate since 2010. We curate exceptional properties for India's most discerning clients.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/buy" className="hover:text-primary transition-colors">
                  Buy Property
                </Link>
              </li>
              <li>
                <Link to="/rent" className="hover:text-primary transition-colors">
                  Rent Property
                </Link>
              </li>
              <li>
                <Link to="/team" className="hover:text-primary transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-primary transition-colors">
                  Compare Properties
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                <span>{APP_CONFIG.companyInfo.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href={`tel:${APP_CONFIG.companyInfo.phone}`} className="hover:text-primary transition-colors">
                  {APP_CONFIG.companyInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href={`mailto:${APP_CONFIG.companyInfo.email}`} className="hover:text-primary transition-colors">
                  {APP_CONFIG.companyInfo.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe for exclusive property updates and market insights.
            </p>
            <form className="flex gap-2" onSubmit={handleNewsletterSubmit}>
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary-foreground/10 border-border/30"
                disabled={loading}
              />
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-border/20 mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} V Horizon Properties. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
