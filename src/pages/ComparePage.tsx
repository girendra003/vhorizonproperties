import { Link } from "react-router-dom";
import { X, Check, Minus, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useCompareStore } from "@/hooks/useCompareStore";
import { useProperties } from "@/hooks/useProperties";
import { formatPriceShort } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ComparePage() {
  const { compareIds, removeFromCompare, clearCompare } = useCompareStore();
  const { getPropertyById } = useProperties();
  const properties = compareIds.map((id) => getPropertyById(id)).filter(Boolean);

  // Collect all unique amenities
  const allAmenities = [...new Set(properties.flatMap((p) => p!.amenities))].sort();

  if (properties.length === 0) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">No Properties to Compare</h1>
          <p className="text-muted-foreground mb-8">
            Add properties to compare by clicking the compare button on property cards.
          </p>
          <Button asChild>
            <Link to="/buy">Browse Properties</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link to="/buy">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Listings
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">
              Compare <span className="text-primary">Properties</span>
            </h1>
          </div>
          <Button variant="outline" onClick={clearCompare}>
            Clear All
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="text-left p-4 bg-muted rounded-tl-xl w-48">Property</th>
                {properties.map((property, index) => (
                  <th
                    key={property!.id}
                    className={cn(
                      "p-4 bg-muted",
                      index === properties.length - 1 && "rounded-tr-xl"
                    )}
                  >
                    <div className="relative">
                      <button
                        onClick={() => removeFromCompare(property!.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <Link to={`/property/${property!.id}`}>
                        <img
                          src={property!.heroImage}
                          alt={property!.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h3 className="font-semibold hover:text-primary transition-colors">
                          {property!.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {property!.area}, {property!.location}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Price */}
              <tr className="border-b border-border">
                <td className="p-4 font-medium">Price</td>
                {properties.map((property) => (
                  <td key={property!.id} className="p-4 text-center">
                    <span className="text-primary font-bold text-lg">
                      {formatPriceShort(property!.price)}
                    </span>
                    {property!.status === "rent" && (
                      <span className="text-sm text-muted-foreground">/mo</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Type */}
              <tr className="border-b border-border">
                <td className="p-4 font-medium">Type</td>
                {properties.map((property) => (
                  <td key={property!.id} className="p-4 text-center capitalize">
                    {property!.type}
                  </td>
                ))}
              </tr>

              {/* Bedrooms */}
              <tr className="border-b border-border">
                <td className="p-4 font-medium">Bedrooms</td>
                {properties.map((property) => (
                  <td key={property!.id} className="p-4 text-center">
                    {property!.beds}
                  </td>
                ))}
              </tr>

              {/* Bathrooms */}
              <tr className="border-b border-border">
                <td className="p-4 font-medium">Bathrooms</td>
                {properties.map((property) => (
                  <td key={property!.id} className="p-4 text-center">
                    {property!.baths}
                  </td>
                ))}
              </tr>

              {/* Size */}
              <tr className="border-b border-border">
                <td className="p-4 font-medium">Size (SqFt)</td>
                {properties.map((property) => (
                  <td key={property!.id} className="p-4 text-center">
                    {property!.sqft.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Price per SqFt */}
              <tr className="border-b border-border">
                <td className="p-4 font-medium">Price / SqFt</td>
                {properties.map((property) => (
                  <td key={property!.id} className="p-4 text-center">
                    ₹{Math.round(property!.price / property!.sqft).toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Amenities Header */}
              <tr className="bg-muted/50">
                <td colSpan={properties.length + 1} className="p-4 font-semibold">
                  Amenities
                </td>
              </tr>

              {/* Each Amenity */}
              {allAmenities.map((amenity) => (
                <tr key={amenity} className="border-b border-border">
                  <td className="p-4 text-sm">{amenity}</td>
                  {properties.map((property) => (
                    <td key={property!.id} className="p-4 text-center">
                      {property!.amenities.includes(amenity) ? (
                        <Check className="h-5 w-5 text-success mx-auto" />
                      ) : (
                        <Minus className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
