import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, MapPin, Bed, Bath, Maximize, Phone, Mail } from "lucide-react";
import Layout from "@/components/Layout";
import ImageGallery from "@/components/ImageGallery";
import ContactForm from "@/components/ContactForm";
import MortgageCalculator from "@/components/MortgageCalculator";
import PropertyCard from "@/components/PropertyCard";
import ShareButtons from "@/components/ShareButtons";
import VirtualTour from "@/components/VirtualTour";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { useRecentlyViewedStore } from "@/hooks/useRecentlyViewed";
import { useProperties } from "@/hooks/useProperties";
import { useAgents } from "@/hooks/useAgents";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { properties, getPropertyById } = useProperties();
  const { getAgentById } = useAgents();
  const property = getPropertyById(Number(id));
  const { addToRecent } = useRecentlyViewedStore();

  // Track recently viewed
  useEffect(() => {
    if (property) {
      addToRecent(property.id);
    }
  }, [property, addToRecent]);

  if (!property) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/buy">Browse Properties</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const agent = getAgentById(property.agentId);
  const similarProperties = properties
    .filter((p) => p.id !== property.id && p.type === property.type)
    .slice(0, 3);

  const propertyUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="container py-4">
        <Link
          to="/buy"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Listings
        </Link>
      </div>

      <div className="container pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            <ImageGallery images={property.gallery} title={property.title} />

            {/* Title & Quick Info */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant={property.status === "rent" ? "secondary" : "default"}>
                      For {property.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {property.type}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold">{property.title}</h1>
                  <p className="text-muted-foreground flex items-center gap-2 mt-2">
                    <MapPin className="h-4 w-4" />
                    {property.area}, {property.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(property.price)}
                  </p>
                  {property.status === "rent" && (
                    <p className="text-sm text-muted-foreground">per month</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-6 py-4 border-y border-border">
                {property.type !== "commercial" && (
                  <>
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-primary" />
                      <span>{property.beds} Bedrooms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-primary" />
                      <span>{property.baths} Bathrooms</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <Maximize className="h-5 w-5 text-primary" />
                  <span>{property.sqft.toLocaleString()} SqFt</span>
                </div>
                {property.type === "commercial" && property.currentRent && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-emerald-700 bg-emerald-100 hover:bg-emerald-200 border-emerald-200">
                      Rent: {formatPrice(property.currentRent)}/mo
                    </Badge>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mt-4">
                <ShareButtons
                  url={propertyUrl}
                  title={property.title}
                  description={property.description}
                />
                {property.virtualTourUrl && (
                  <VirtualTour
                    tourUrl={property.virtualTourUrl}
                    propertyTitle={property.title}
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Form */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-card">
              <h3 className="font-semibold text-lg mb-4">Interested in this property?</h3>
              <ContactForm
                propertyId={property.id}
                propertyTitle={property.title}
              />
            </div>

            {/* Agent Card */}
            {agent && (
              <div className="bg-card p-6 rounded-xl border border-border">
                <h4 className="font-semibold mb-4">Listed By</h4>
                <div className="flex items-center gap-4">
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-primary">{agent.role}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <a href={`tel:${agent.phone}`}>
                      <Phone className="h-3.5 w-3.5 mr-1" />
                      Call
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <a href={`mailto:${agent.email}`}>
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      Email
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* Mortgage Calculator */}
            {property.status === "sale" && (
              <div className="bg-muted p-6 rounded-xl border border-border">
                <MortgageCalculator propertyPrice={property.price} />
              </div>
            )}
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
