import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Check } from "lucide-react";
import Layout from "@/components/Layout";
import PropertyCard from "@/components/PropertyCard";
import TestimonialsSection from "@/components/TestimonialsSection";
import HeroCarousel from "@/components/HeroCarousel";
import { Button } from "@/components/ui/button";
import { useProperties } from "@/hooks/useProperties";

const features = [
  "Off-Market Listings",
  "Legal & Tax Advisory",
  "Interior Design Concierge",
  "Property Management",
];

// ... imports

export default function Index() {
  const { properties } = useProperties();
  const featuredProperties = properties.slice(0, 3);

  return (
    <Layout>
      <Helmet>
        <title>V Horizon Properties | Buy Studio Apartments & Luxury Stays</title>
        <meta name="description" content="Find your dream property with V Horizon Properties. We specialize in luxury stays, studio apartments, and premium real estate in Delhi, Ghaziabad, Noida, and Gurugram." />
        <link rel="canonical" href="https://vhorizonproperties.in/" />
      </Helmet>
      {/* Hero Section with Carousel */}
      <HeroCarousel>
        <div className="container text-center text-white px-4 sm:px-6">
          <p className="text-xs sm:text-sm lg:text-base uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary mb-3 sm:mb-4 animate-fade-in">
            Premium Real Estate & Stays
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            Architecture as{" "}
            <span className="font-serif italic text-primary">Art.</span>
          </h1>
          <p className="text-sm sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-10 max-w-2xl mx-auto animate-fade-in px-2" style={{ animationDelay: "200ms" }}>
            Curating exceptional properties, including luxury studio apartments and stays, in Delhi NCR.
          </p>

          <div className="inline-flex flex-col sm:flex-row gap-2 sm:gap-3 p-2 sm:p-3 rounded-2xl sm:rounded-full bg-white/10 backdrop-blur-md border border-white/20 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Link to="/buy">
              <Button size="lg" className="rounded-full px-8 sm:px-10 text-sm sm:text-base font-semibold w-full sm:w-auto">
                Buy
              </Button>
            </Link>
            <Link to="/rent">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 sm:px-10 text-sm sm:text-base font-semibold bg-transparent border-white/40 text-white hover:bg-white/20 hover:border-white/60 w-full sm:w-auto"
              >
                Rent
              </Button>
            </Link>
          </div>
        </div>
      </HeroCarousel>

      {/* Featured Properties */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Curated <span className="text-primary">Collection</span>
              </h2>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                Hand-picked for architectural significance.
              </p>
            </div>
            <Button asChild variant="outline" className="w-fit">
              <Link to="/buy">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {featuredProperties.map((property, idx) => (
              <PropertyCard
                key={property.id}
                property={property}
                className="animate-fade-in"
                style={{ animationDelay: `${idx * 100}ms` } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Why V Horizon Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-secondary text-secondary-foreground">
        <div className="container px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                Why <span className="text-primary">V Horizon?</span>
              </h2>
              <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">
                We don't just sell homes; we curate lifestyles. Our private office provides discreet, high-touch advisory services for India's Ultra-HNI community.
              </p>

              <ul className="space-y-3 sm:space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary-foreground" />
                    </div>
                    <span className="text-sm sm:text-base">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button asChild className="mt-6 sm:mt-8">
                <Link to="/team">Meet Our Team</Link>
              </Button>
            </div>

            <div className="relative mt-8 lg:mt-0">
              <img
                src="https://images.unsplash.com/photo-1556912172-45b7abe8d7e1?q=80&w=800"
                alt="Luxury Interior"
                className="rounded-xl shadow-float w-full"
              />
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-card p-4 sm:p-6 rounded-xl shadow-card hidden sm:block">
                <p className="text-2xl sm:text-3xl font-bold text-primary">10+</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="container px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            Ready to Find Your Dream Estate?
          </h2>
          <p className="text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
            Our team of expert advisors is ready to help you discover the perfect property.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/buy">Browse Properties</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link to="/team">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
