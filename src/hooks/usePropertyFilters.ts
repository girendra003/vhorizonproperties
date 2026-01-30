import { useState, useEffect, useMemo, useCallback } from "react";
import { Property, SortOption, FilterState } from "@/lib/types";
import { useProperties } from "@/hooks/useProperties";

export type SortKey = "featured" | "price-asc" | "price-desc" | "beds-desc" | "sqft-desc" | "newest";

const sortOptions: SortOption[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "beds-desc", label: "Most Bedrooms" },
  { value: "sqft-desc", label: "Largest Size" },
  { value: "newest", label: "Newest First" },
];

export function usePropertyFilters(defaultStatus: "sale" | "rent" = "sale") {
  const { properties } = useProperties(); // Use the hook here

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "all",
    status: "all", // We'll set this in useEffect to respect defaultStatus but allow 'all'
    maxPrice: 200000000,
    minBeds: 0,
    minBaths: 0,
    minSqft: 0,
    maxSqft: 100000, // Increased from 10000 to accommodate large properties
    amenities: [],
  });

  const [pendingFilters, setPendingFilters] = useState<FilterState>(filters);
  const [sortBy, setSortBy] = useState<SortKey>("featured");

  // Sync initial status - run once
  useEffect(() => {
    setFilters(prev => ({ ...prev, status: defaultStatus }));
    setPendingFilters(prev => ({ ...prev, status: defaultStatus }));
  }, [defaultStatus]);

  const allAmenities = useMemo(() => {
    const amenitySet = new Set<string>();
    properties.forEach((p) => p.amenities.forEach((a) => amenitySet.add(a)));
    return Array.from(amenitySet).sort();
  }, [properties]);

  const allLocations = useMemo(() => {
    const locationSet = new Set<string>();
    properties.forEach((p) => {
      locationSet.add(p.location);
      locationSet.add(p.area);
    });
    return Array.from(locationSet).sort();
  }, [properties]);

  const filteredProperties = useMemo(() => {
    let result = properties.filter((p) => {
      const searchLower = filters.search.toLowerCase();
      const matchSearch =
        !searchLower ||
        p.location.toLowerCase().includes(searchLower) ||
        p.title.toLowerCase().includes(searchLower) ||
        p.area.toLowerCase().includes(searchLower);

      const matchType = filters.type === "all" || p.type === filters.type;
      // Treat "lease" as equivalent to "rent" for filtering
      const matchStatus =
        filters.status === "all" ||
        p.status === filters.status ||
        (filters.status === "rent" && p.status === "lease");
      const matchPrice = p.price <= filters.maxPrice;
      const matchBeds = p.beds >= filters.minBeds;
      const matchBaths = p.baths >= filters.minBaths;
      const matchSqft = p.sqft >= filters.minSqft && p.sqft <= filters.maxSqft;
      const matchAmenities =
        filters.amenities.length === 0 ||
        filters.amenities.every((a) => p.amenities.includes(a));

      return (
        matchSearch &&
        matchType &&
        matchStatus &&
        matchPrice &&
        matchBeds &&
        matchBaths &&
        matchSqft &&
        matchAmenities
      );
    });

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "beds-desc":
          return b.beds - a.beds;
        case "sqft-desc":
          return b.sqft - a.sqft;
        case "newest":
        default:
          return b.id - a.id;
      }
    });

    return result;
  }, [filters, sortBy, properties]);

  // Update pending filters (not applied yet)
  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setPendingFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleAmenity = useCallback((amenity: string) => {
    setPendingFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }, []);

  // Apply pending filters to active filters
  const applyFilters = useCallback(() => {
    setFilters(pendingFilters);
  }, [pendingFilters]);

  const resetFilters = useCallback(() => {
    const reset: FilterState = {
      search: "",
      type: "all",
      status: defaultStatus || "all",
      maxPrice: 200000000,
      minBeds: 0,
      minBaths: 0,
      minSqft: 0,
      maxSqft: 100000,
      amenities: [],
    };
    setPendingFilters(reset);
    setFilters(reset);
  }, [defaultStatus]);

  const searchSuggestions = useMemo(() => {
    if (!pendingFilters.search || pendingFilters.search.length < 2) return [];

    const searchLower = pendingFilters.search.toLowerCase();
    const suggestions: string[] = [];

    // Property titles
    properties.forEach((p) => {
      if (p.title.toLowerCase().includes(searchLower) && !suggestions.includes(p.title)) {
        suggestions.push(p.title);
      }
    });

    // Locations and areas
    allLocations.forEach((loc) => {
      if (loc.toLowerCase().includes(searchLower) && !suggestions.includes(loc)) {
        suggestions.push(loc);
      }
    });

    return suggestions.slice(0, 5);
  }, [pendingFilters.search, allLocations, properties]);

  // Check if pending differs from applied (to show "Apply" button)
  const hasChanges = useMemo(() => {
    return JSON.stringify(pendingFilters) !== JSON.stringify(filters);
  }, [pendingFilters, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type !== "all") count++;
    if (filters.status !== (defaultStatus || "all")) count++;
    if (filters.maxPrice < 200000000) count++;
    if (filters.minBeds > 0) count++;
    if (filters.minBaths > 0) count++;
    if (filters.minSqft > 0) count++;
    if (filters.maxSqft < 100000) count++;
    if (filters.amenities.length > 0) count++;
    return count;
  }, [filters, defaultStatus]);

  return {
    filters,
    pendingFilters,
    sortBy,
    sortOptions,
    filteredProperties,
    allAmenities,
    allLocations,
    searchSuggestions,
    activeFilterCount,
    hasChanges,
    updateFilter,
    toggleAmenity,
    applyFilters,
    resetFilters,
    setSortBy,
  };
}
