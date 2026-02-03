import { useState } from "react";
import Layout from "@/components/Layout";
import PropertyCard from "@/components/PropertyCard";
import PropertyFilters from "@/components/PropertyFilters";
import PropertySort from "@/components/PropertySort";
import CompareBar from "@/components/CompareBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePropertyFilters } from "@/hooks/usePropertyFilters";
import { useCompareStore } from "@/hooks/useCompareStore";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ListingsPageProps {
  defaultStatus?: "sale" | "rent";
}

export default function ListingsPage({ defaultStatus = "sale" }: ListingsPageProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const {
    filters,
    pendingFilters,
    sortBy,
    sortOptions,
    filteredProperties,
    allAmenities,
    searchSuggestions,
    activeFilterCount,
    hasChanges,
    updateFilter,
    toggleAmenity,
    applyFilters,
    resetFilters,
    setSortBy,
    isLoading,
    error,
  } = usePropertyFilters(defaultStatus);

  const { compareIds } = useCompareStore();

  const handleApplyAndClose = () => {
    applyFilters();
    setMobileFiltersOpen(false);
  };

  return (
    <Layout>
      <div className="container px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
            <div className="sticky top-24 bg-card p-4 xl:p-6 rounded-xl border border-border shadow-sm">
              <h3 className="font-semibold text-lg mb-4 xl:mb-6">Filters</h3>
              <PropertyFilters
                filters={pendingFilters}
                allAmenities={allAmenities}
                searchSuggestions={searchSuggestions}
                activeFilterCount={activeFilterCount}
                hasChanges={hasChanges}
                updateFilter={updateFilter}
                toggleAmenity={toggleAmenity}
                applyFilters={applyFilters}
                resetFilters={resetFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <section className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {defaultStatus === "rent" ? "Rent" : "Buy"}{" "}
                  <span className="text-primary">Properties</span>
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                  Showing {filteredProperties.length} verified listings
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Sort Dropdown */}
                <PropertySort
                  sortBy={sortBy}
                  sortOptions={sortOptions}
                  onSortChange={setSortBy}
                />

                {/* Mobile Filter Button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85vw] max-w-sm overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <PropertyFilters
                        filters={pendingFilters}
                        allAmenities={allAmenities}
                        searchSuggestions={searchSuggestions}
                        activeFilterCount={activeFilterCount}
                        hasChanges={hasChanges}
                        updateFilter={updateFilter}
                        toggleAmenity={toggleAmenity}
                        applyFilters={handleApplyAndClose}
                        resetFilters={resetFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-500">
                <h3 className="text-xl font-semibold mb-2">Error loading properties</h3>
                <p>{(error as Error).message}</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                  Retry
                </Button>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters.
                </p>
                <Button onClick={resetFilters}>Reset Filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredProperties.map((property, idx) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    className="animate-fade-in"
                    style={{ animationDelay: `${idx * 50}ms` } as React.CSSProperties}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
      {/* Compare Bar */}
      <CompareBar />

      {/* Add padding at bottom when compare bar is visible */}
      {compareIds.length > 0 && <div className="h-20" />}
    </Layout>
  );
}
