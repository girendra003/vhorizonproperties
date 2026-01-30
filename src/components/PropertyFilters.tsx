import { useRef, useState } from "react";
import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatPriceShort } from "@/lib/utils";
import { FilterState } from "@/lib/types";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyFiltersProps {
  filters: FilterState;
  allAmenities: string[];
  searchSuggestions: string[];
  activeFilterCount: number;
  hasChanges: boolean;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  toggleAmenity: (amenity: string) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

export default function PropertyFilters({
  filters,
  allAmenities,
  searchSuggestions,
  activeFilterCount,
  hasChanges,
  updateFilter,
  toggleAmenity,
  applyFilters,
  resetFilters,
}: PropertyFiltersProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleSuggestionClick = (suggestion: string) => {
    updateFilter("search", suggestion);
    setShowSuggestions(false);
    searchRef.current?.blur();
  };

  return (
    <div className="space-y-6">
      {/* Search with Autocomplete */}
      <div className="relative">
        <Label htmlFor="search">Search</Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            id="search"
            placeholder="City, area, or property..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 pr-8"
          />
          {filters.search && (
            <button
              onClick={() => updateFilter("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
            {searchSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* Property Type */}
      <div>
        <Label>Property Type</Label>
        <Select
          value={filters.type}
          onValueChange={(value) => updateFilter("type", value as FilterState["type"])}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="villa">Villa</SelectItem>
            <SelectItem value="penthouse">Penthouse</SelectItem>
            <SelectItem value="estate">Estate</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listing Type */}
      <div>
        <Label>Listing Type</Label>
        <Select
          value={filters.status}
          onValueChange={(value) => updateFilter("status", value as FilterState["status"])}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Listings</SelectItem>
            <SelectItem value="sale">For Sale</SelectItem>
            <SelectItem value="rent">For Rent</SelectItem>
            <SelectItem value="lease">For Lease</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-px bg-border" />

      {/* Max Price */}
      <div>
        <div className="flex justify-between items-center">
          <Label>Max Price</Label>
          <span className="text-sm text-primary font-medium">
            {formatPriceShort(filters.maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min={10000000}
          max={2000000000}
          step={10000000}
          value={filters.maxPrice}
          onChange={(e) => updateFilter("maxPrice", Number(e.target.value))}
          className="w-full mt-2 accent-primary"
        />
      </div>

      {/* Bedrooms & Bathrooms */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="beds">Min Beds</Label>
          <Input
            id="beds"
            type="number"
            min={0}
            max={10}
            value={filters.minBeds}
            onChange={(e) => updateFilter("minBeds", Number(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="baths">Min Baths</Label>
          <Input
            id="baths"
            type="number"
            min={0}
            max={10}
            value={filters.minBaths}
            onChange={(e) => updateFilter("minBaths", Number(e.target.value))}
            className="mt-1"
          />
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Square Footage Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minSqft">Min SqFt</Label>
          <Input
            id="minSqft"
            type="number"
            min={0}
            value={filters.minSqft}
            onChange={(e) => updateFilter("minSqft", Number(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="maxSqft">Max SqFt</Label>
          <Input
            id="maxSqft"
            type="number"
            min={0}
            value={filters.maxSqft}
            onChange={(e) => updateFilter("maxSqft", Number(e.target.value))}
            className="mt-1"
          />
        </div>
      </div>

      {/* Amenities */}
      <Collapsible open={amenitiesOpen} onOpenChange={setAmenitiesOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <Label className="cursor-pointer">
            Amenities
            {filters.amenities.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filters.amenities.length}
              </Badge>
            )}
          </Label>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${amenitiesOpen ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="grid grid-cols-2 gap-2">
            {allAmenities.map((amenity) => (
              <label
                key={amenity}
                className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors"
              >
                <Checkbox
                  checked={filters.amenities.includes(amenity)}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <span className="truncate">{amenity}</span>
              </label>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="h-px bg-border" />

      {/* Apply Filters Button */}
      <Button
        onClick={applyFilters}
        className={cn(
          "w-full transition-all",
          hasChanges
            ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
            : "bg-primary/80"
        )}
        disabled={!hasChanges}
      >
        <Filter className="h-4 w-4 mr-2" />
        Apply Filters
        {hasChanges && (
          <span className="ml-2 w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
        )}
      </Button>

      {/* Active Filters & Reset */}
      {activeFilterCount > 0 && (
        <Button variant="outline" className="w-full" onClick={resetFilters}>
          Reset Filters
          <Badge variant="secondary" className="ml-2">
            {activeFilterCount}
          </Badge>
        </Button>
      )}
    </div>
  );
}
