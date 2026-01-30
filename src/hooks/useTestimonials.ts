import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Testimonial } from "@/lib/types";

export function useTestimonials() {
    const { data: testimonials = [], isLoading, error } = useQuery({
        queryKey: ["testimonials"],
        queryFn: async () => {
            const { data, error } = await supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from("testimonials" as any)
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching testimonials:", error);
                throw error;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (data || []).map((item: any) => ({
                id: item.id,
                name: item.name,
                role: item.role,
                image: item.image,
                quote: item.quote,
                rating: item.rating,
                propertyType: item.property_type, // Map snake_case to camelCase
            })) as Testimonial[];
        },
    });

    return {
        testimonials,
        isLoading,
        error,
    };
}
