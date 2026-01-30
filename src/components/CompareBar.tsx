import { Link, useNavigate } from "react-router-dom";
import { X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompareStore } from "@/hooks/useCompareStore";
import { useProperties } from "@/hooks/useProperties";
import { formatPriceShort } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function CompareBar() {
  const navigate = useNavigate();
  const { compareIds, removeFromCompare, clearCompare } = useCompareStore();
  const { getPropertyById } = useProperties();

  if (compareIds.length === 0) return null;

  const properties = compareIds.map((id) => getPropertyById(id)).filter(Boolean);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-float p-4">
      <div className="container">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Compare ({compareIds.length}/4):
            </span>
            {properties.map((property) => (
              <div
                key={property!.id}
                className="flex items-center gap-2 bg-muted rounded-full pl-1 pr-2 py-1"
              >
                <img
                  src={property!.heroImage}
                  alt={property!.title}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium whitespace-nowrap max-w-[100px] truncate">
                  {property!.title}
                </span>
                <button
                  onClick={() => removeFromCompare(property!.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={clearCompare}>
              Clear
            </Button>
            <Button
              size="sm"
              disabled={compareIds.length < 2}
              onClick={() => navigate("/compare")}
            >
              Compare
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
