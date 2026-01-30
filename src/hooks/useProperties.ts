import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/lib/types";

export function useProperties() {
    const { data: properties = [], isLoading, error } = useQuery({
        queryKey: ["properties"],
        queryFn: async () => {
            // Fetch from Supabase
            const { data, error } = await supabase
                .from("properties" as any)
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching properties:", error);
                throw error;
            }

            // Map snake_case DB fields to camelCase TS interface
            return data.map((item: any) => ({
                ...item,
                heroImage: item.hero_image,
                agentId: item.agent_id,
                superArea: item.super_area,
                carpetArea: item.carpet_area,
                currentRent: item.current_rent,
                virtualTourUrl: item.virtual_tour_url,
                // Ensure arrays are handled if they come as null
                amenities: item.amenities || [],
                gallery: item.gallery || []
            })) as Property[];
        },
    });

    const getPropertyById = (id: number) => {
        return properties.find(p => p.id === id);
    };

    return {
        properties,
        getPropertyById,
        isLoading,
        error
    };
}
