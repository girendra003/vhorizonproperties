import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { useProperties } from "@/hooks/useProperties";
import { formatPriceShort } from "@/lib/utils";
import { X } from "lucide-react";

interface FavoritesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FavoritesDrawer({ open, onOpenChange }: FavoritesDrawerProps) {
  const { favorites, toggleFavorite } = useFavorites();
  const { properties } = useProperties();
  const favoriteProperties = properties.filter((p) => favorites.includes(p.id));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Saved Homes</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {favoriteProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <p>No saved properties yet.</p>
              <p className="text-sm mt-2">Click the heart icon on properties you love.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {favoriteProperties.map((property) => (
                <div
                  key={property.id}
                  className="flex gap-4 p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <Link
                    to={`/property/${property.id}`}
                    onClick={() => onOpenChange(false)}
                  >
                    <img
                      src={property.heroImage}
                      alt={property.title}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/property/${property.id}`}
                      onClick={() => onOpenChange(false)}
                      className="font-medium hover:text-primary transition-colors line-clamp-1"
                    >
                      {property.title}
                    </Link>
                    <p className="text-primary font-semibold text-sm mt-1">
                      {formatPriceShort(property.price)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {property.location}
                    </p>
                    <button
                      onClick={() => toggleFavorite(property.id)}
                      className="text-xs text-destructive hover:underline mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button asChild className="w-full mt-4">
          <Link to="/buy" onClick={() => onOpenChange(false)}>
            Browse More Properties
          </Link>
        </Button>
      </SheetContent>
    </Sheet>
  );
}
