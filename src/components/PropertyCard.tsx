import { Link } from "react-router-dom";
import { Heart, Scale } from "lucide-react";
import { Property } from "@/lib/types";
import { formatPriceShort } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/useFavorites";
import { useCompareStore } from "@/hooks/useCompareStore";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  className?: string;
  style?: React.CSSProperties;
  showCompare?: boolean;
}

export default function PropertyCard({
  property,
  className,
  style,
  showCompare = true,
}: PropertyCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCompare, removeFromCompare, isInCompare } = useCompareStore();
  const favorite = isFavorite(property.id);
  const inCompare = isInCompare(property.id);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCompare) {
      removeFromCompare(property.id);
    } else {
      addToCompare(property.id);
    }
  };

  return (
    <article
      className={cn(
        "property-card group transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        className
      )}
      style={style}
    >
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        <Badge
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 uppercase text-xs"
          variant={property.status === "rent" || property.status === "lease" ? "secondary" : "default"}
        >
          For {property.status}
        </Badge>

        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex gap-1.5 sm:gap-2">
          {showCompare && (
            <button
              onClick={handleCompareClick}
              className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-all hover:scale-110",
                inCompare && "bg-primary text-primary-foreground"
              )}
              aria-label={inCompare ? "Remove from compare" : "Add to compare"}
            >
              <Scale className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(property.id);
            }}
            className={cn(
              "w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-all hover:scale-110",
              favorite && "text-destructive"
            )}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", favorite && "fill-current")} />
          </button>
        </div>

        <Link to={`/property/${property.id}`}>
          <img
            src={property.heroImage}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link to={`/property/${property.id}`}>
            <h3 className="font-semibold text-base sm:text-lg hover:text-primary transition-colors line-clamp-1">
              {property.title}
            </h3>
          </Link>
          <span className="text-primary font-bold whitespace-nowrap text-sm sm:text-base">
            {property.price > 0 ? formatPriceShort(property.price) : "Contact"}
            {property.status === "rent" && property.price > 0 && <span className="text-xs font-normal">/mo</span>}
          </span>
        </div>

        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-1">
          {property.area}, {property.location}
        </p>

        <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground border-t border-border pt-3 sm:pt-4 mb-3 sm:mb-4">
          {property.type === "commercial" ? (
            <>
              <span>{property.sqft.toLocaleString()} SqFt</span>
              {property.carpetArea && <span className="hidden sm:inline">Carpet: {property.carpetArea.toLocaleString()}</span>}
              {property.currentRent && (
                <span className="text-emerald-600 font-medium">Rent: ₹{property.currentRent.toLocaleString()}/mo</span>
              )}
            </>
          ) : (
            <>
              <span>{property.beds} Beds</span>
              <span>{property.baths} Baths</span>
              <span>{property.sqft.toLocaleString()} SqFt</span>
            </>
          )}
        </div>

        <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Link to={`/property/${property.id}`}>View Details</Link>
        </Button>
      </div>
    </article>
  );
}
