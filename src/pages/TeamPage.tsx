import Layout from "@/components/Layout";
import AgentCard from "@/components/AgentCard";
import ContactForm from "@/components/ContactForm";
import { APP_CONFIG } from "@/lib/config";
import { useAgents } from "@/hooks/useAgents";
import { MapPin, Phone, Mail, Award, Users, Home } from "lucide-react";

const stats = [
  { icon: Home, value: "500+", label: "Properties Sold" },
  { icon: Users, value: "1000+", label: "Happy Clients" },
  { icon: Award, value: "15+", label: "Years Experience" },
];

export default function TeamPage() {
  const { agents } = useAgents();
  return (
    <Layout>
      {/* Hero Section - Meet Our Founders */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        {/* Premium background with luxury pattern */}
        <div className="absolute inset-0 bg-secondary">
          {/* Subtle geometric pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E86830' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-charcoal-light/80" />
          {/* Subtle glow effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="container px-4 sm:px-6 text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Meet Our <span className="text-primary">Team</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg px-4">
            Our experienced team is committed to redefining luxury real estate in India with personalized service and market expertise.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 sm:py-12 bg-background border-b border-border">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                  <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <p className="text-2xl sm:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs sm:text-base text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders Grid - Using AgentCard Component */}
      <section className="py-12 sm:py-20 bg-background">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Our <span className="text-primary">Team</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base px-4">
              With combined expertise spanning commercial investments and luxury residentials, our team leads V Horizon Properties with passion and integrity.
            </p>
          </div>

          {/* Simple Grid using AgentCard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-16 bg-muted">
        <div className="container px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                Get in <span className="text-primary">Touch</span>
              </h2>
              <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
                Have a question or ready to start your property search? Our team is here to help you every step of the way.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Office Address</p>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      {APP_CONFIG.companyInfo.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Phone</p>
                    <a
                      href={`tel:${APP_CONFIG.companyInfo.phone}`}
                      className="text-muted-foreground text-xs sm:text-sm hover:text-primary transition-colors"
                    >
                      {APP_CONFIG.companyInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Email</p>
                    <a
                      href={`mailto:${APP_CONFIG.companyInfo.email}`}
                      className="text-muted-foreground text-xs sm:text-sm hover:text-primary transition-colors"
                    >
                      {APP_CONFIG.companyInfo.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card p-5 sm:p-8 rounded-xl border border-border shadow-card">
              <h3 className="font-semibold text-lg sm:text-xl mb-4 sm:mb-6">Send us a Message</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
