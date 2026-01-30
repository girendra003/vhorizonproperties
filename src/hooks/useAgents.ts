import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Agent } from "@/lib/types";

export function useAgents() {
    const { data: agents = [], isLoading, error } = useQuery({
        queryKey: ["agents"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("agents" as any)
                .select("*")
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Error fetching agents:", error);
                throw error;
            }

            return data.map((item: any) => ({
                ...item,
            })) as Agent[];
        },
    });

    const getAgentById = (id: string) => {
        return agents.find((a) => a.id === id);
    };

    return {
        agents,
        getAgentById,
        isLoading,
        error,
    };
}
