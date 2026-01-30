
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    MapPin,
    DollarSign,
    Building,
    BedDouble,
    Bath,
    Loader2,
    Calendar,
    Mail,
    Phone,
    Check,
    AlertCircle,
    Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { PropertyRequirement } from "@/lib/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminRequirements() {
    // Fetch Requirements
    const { data: requirements = [], isLoading } = useQuery({
        queryKey: ["admin_requirements"],
        queryFn: async () => {
            const { data, error } = await supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from("property_requirements" as any)
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching requirements:", error);
                // Return empty array instead of throwing to prevent crash
                return [];
            }
            console.log("Requirements data:", data); // Debug log
            return (data || []) as unknown as PropertyRequirement[];
        },
    });

    const queryClient = useQueryClient();

    const updateRequirementMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from("property_requirements" as any)
                .update({ status })
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin_requirements"] });
            toast.success("Requirement status updated");
        },
        onError: () => {
            toast.error("Failed to update status");
        }
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "contacted":
                return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Contacted</Badge>;
            case "resolved":
                return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><Check className="h-3 w-3 mr-1" /> Resolved</Badge>;
            default:
                return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" /> New</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold tracking-tight">User Requirements</h2>
                <Badge variant="outline">{requirements.length} Total</Badge>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : requirements.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">No requirements submitted yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requirements.map((req: PropertyRequirement) => (
                        <Card key={req.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            {req.location}
                                        </CardTitle>
                                        <CardDescription>
                                            Requested on {format(new Date(req.created_at), "PPP")}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(req.status)}
                                            <Select
                                                value={req.status || "new"}
                                                onValueChange={(value) =>
                                                    updateRequirementMutation.mutate({ id: req.id, status: value })
                                                }
                                            >
                                                <SelectTrigger className="w-[120px] h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="new">New</SelectItem>
                                                    <SelectItem value="contacted">Contacted</SelectItem>
                                                    <SelectItem value="resolved">Resolved</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4 bg-muted/30 p-3 rounded-lg border">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span className="capitalize">{req.property_type || "Any Type"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {req.min_budget ? `${(req.min_budget / 100000).toFixed(1)}L` : "0"} -
                                            {req.max_budget ? `${(req.max_budget / 100000).toFixed(1)}L` : "Any"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BedDouble className="h-4 w-4 text-muted-foreground" />
                                        <span>{req.bedrooms || "Any"} Beds</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Bath className="h-4 w-4 text-muted-foreground" />
                                        <span>{req.bathrooms || "Any"} Baths</span>
                                    </div>
                                </div>

                                {req.notes && (
                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-semibold text-foreground">Notes: </span>
                                        {req.notes}
                                    </div>
                                )}

                                {/* User Info Placeholder - Since we can't easily get user email without a profiles table join, we show ID for now or rely on future enhancement */}
                                <div className="mt-4 pt-4 border-t flex gap-4 text-xs text-muted-foreground">
                                    <span>User ID: {req.user_id}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
