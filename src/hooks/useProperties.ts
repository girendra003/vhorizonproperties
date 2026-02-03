import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { supabase as globalSupabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { Property } from "@/lib/types";
import { debugLog } from "@/lib/debug";

/**
 * Original hook - fetches all properties
 * Use for small datasets or when you need all properties at once
 */
export function useProperties() {
    const { data: properties = [], isLoading, error } = useQuery({
        queryKey: ["properties"],
        queryFn: async () => {
            debugLog.info("Fetching properties started...");

            // WORKAROUND: Global supabase client hangs when authenticated.
            // We create a fresh client and manually apply the session.

            let token: string | undefined;

            try {
                // 1. Try to get session from global client with a short timeout (2s)
                // This prevents the whole app from hanging if the global client is deadlocked
                const getSessionPromise = globalSupabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error("Global client session retrieval timed out")), 2000)
                );

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const result = await Promise.race([getSessionPromise, timeoutPromise]) as any;
                token = result.data?.session?.access_token;
                debugLog.info("Got session via global client");
            } catch (err) {
                // 2. Fallback: Try reading from LocalStorage directly
                console.warn("Global client hung/failed, trying Access Token from LocalStorage...", err);

                // Supabase uses a specific key format: sb-<project-ref>-auth-token
                // Project Ref is the subpoena in the URL: https://<ref>.supabase.co
                const projectRef = import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0];
                if (projectRef) {
                    const storageKey = `sb-${projectRef}-auth-token`;
                    const storedSession = localStorage.getItem(storageKey);
                    if (storedSession) {
                        try {
                            const parsed = JSON.parse(storedSession);
                            token = parsed.access_token;
                            debugLog.info("Got session via LocalStorage fallback");
                        } catch (e) {
                            console.error("Failed to parse stored session", e);
                        }
                    }
                }
            }

            const client = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                        detectSessionInUrl: false
                    },
                    global: {
                        headers: token ? { Authorization: `Bearer ${token}` } : undefined
                    }
                }
            );

            // Create a timeout promise (15s)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out fetching properties")), 15000)
            );

            // Fetch using the fresh client
            const fetchPromise = client
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from("properties" as any)
                .select("*")
                .order("created_at", { ascending: false });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const result = await Promise.race([fetchPromise, timeoutPromise]) as any;

            const { data, error } = result;

            if (error) {
                debugLog.authError("Error fetching properties:", error);
                throw error;
            }

            debugLog.info(`Fetched ${data?.length || 0} properties successfully`);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.map((item: any) => ({
                ...item,
                heroImage: item.hero_image,
                agentId: item.agent_id,
                superArea: item.super_area,
                carpetArea: item.carpet_area,
                currentRent: item.current_rent,
                virtualTourUrl: item.virtual_tour_url,
                amenities: item.amenities || [],
                gallery: item.gallery || []
            })) as Property[];
        },
        staleTime: 5 * 60 * 1000,
        retry: 1, // Minimize retries to avoid long waits
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

/**
 * Paginated properties hook
 * Better performance for large datasets
 * 
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @param filters - Optional filters
 */
export function usePaginatedProperties(
    page: number = 1,
    limit: number = 20,
    filters?: {
        status?: string;
        location?: string;
        minPrice?: number;
        maxPrice?: number;
    }
) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["properties-paginated", page, limit, filters],
        queryFn: async () => {
            const start = (page - 1) * limit;
            const end = start + limit - 1;

            let query = supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from("properties" as any)
                // Selective fields for better performance
                .select("id, title, price, location, status, hero_image, bedrooms, bathrooms, size, property_type", { count: 'exact' });

            // Apply filters
            if (filters?.status) {
                query = query.eq("status", filters.status);
            }
            if (filters?.location) {
                query = query.ilike("location", `%${filters.location}%`);
            }
            if (filters?.minPrice) {
                query = query.gte("price", filters.minPrice);
            }
            if (filters?.maxPrice) {
                query = query.lte("price", filters.maxPrice);
            }

            const { data, error, count } = await query
                .range(start, end)
                .order("created_at", { ascending: false });

            if (error) {
                debugLog.authError("Error fetching paginated properties:", error);
                throw error;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const properties = data.map((item: any) => ({
                ...item,
                heroImage: item.hero_image,
                propertyType: item.property_type,
            })) as Partial<Property>[];

            return {
                properties,
                total: count || 0,
                page,
                limit,
                totalPages: Math.ceil((count || 0) / limit),
            };
        },
        staleTime: 5 * 60 * 1000,
    });

    return {
        properties: data?.properties || [],
        total: data?.total || 0,
        page: data?.page || 1,
        totalPages: data?.totalPages || 1,
        isLoading,
        error,
    };
}

/**
 * Infinite scroll properties hook
 * Automatically loads more as user scrolls
 */
export function useInfiniteProperties(
    limit: number = 20,
    filters?: {
        status?: string;
        location?: string;
    }
) {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
    } = useInfiniteQuery({
        queryKey: ["properties-infinite", limit, filters],
        initialPageParam: 0,
        queryFn: async ({ pageParam }: { pageParam: number }) => {
            let query = supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from("properties" as any)
                .select("id, title, price, location, status, hero_image, bedrooms, bathrooms, size, property_type");

            // Apply filters
            if (filters?.status) {
                query = query.eq("status", filters.status);
            }
            if (filters?.location) {
                query = query.ilike("location", `%${filters.location}%`);
            }

            const { data, error } = await query
                .range(pageParam, pageParam + limit - 1)
                .order("created_at", { ascending: false });

            if (error) {
                debugLog.authError("Error fetching infinite properties:", error);
                throw error;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.map((item: any) => ({
                ...item,
                heroImage: item.hero_image,
                propertyType: item.property_type,
            })) as Partial<Property>[];
        },
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < limit) return undefined;
            return allPages.length * limit;
        },
        staleTime: 5 * 60 * 1000,
    });

    const properties = data?.pages.flat() || [];

    return {
        properties,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
    };
}

/**
 * Get single property by ID
 * Optimized for detail pages
 */
export function useProperty(id: number) {
    const { data: property, isLoading, error } = useQuery({
        queryKey: ["property", id],
        queryFn: async () => {
            const { data, error } = await supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from("properties" as any)
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                debugLog.authError("Error fetching property:", error);
                throw error;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const typedData = data as any;

            return {
                ...typedData,
                heroImage: typedData.hero_image,
                agentId: typedData.agent_id,
                superArea: typedData.super_area,
                carpetArea: typedData.carpet_area,
                currentRent: typedData.current_rent,
                virtualTourUrl: typedData.virtual_tour_url,
                propertyType: typedData.property_type,
                amenities: typedData.amenities || [],
                gallery: typedData.gallery || []
            } as Property;
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!id, // Only fetch if ID exists
    });

    return {
        property,
        isLoading,
        error,
    };
}
