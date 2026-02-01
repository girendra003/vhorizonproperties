
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Calendar,
    Home,
    Loader2,
    LogOut,
    Plus,
    Search,
    Trash2,
    MapPin,
    IndianRupee,
    Building,
    BedDouble,
    Bath,
} from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import PropertyCard from "@/components/PropertyCard";
import { useProperties } from "@/hooks/useProperties";
import { PropertyRequirement } from "@/lib/types";

// Schema for property requirements
const requirementSchema = z.object({
    location: z.string().min(2, "Location is required"),
    min_budget: z.string().optional(),
    max_budget: z.string().optional(),
    property_type: z.string().optional(),
    bedrooms: z.string().optional(),
    bathrooms: z.string().optional(),
    notes: z.string().optional(),
});

export default function DashboardPage() {
    const { user, loading: authLoading, signOut } = useRequireAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { properties } = useProperties();

    // Requirements Form
    const form = useForm<z.infer<typeof requirementSchema>>({
        resolver: zodResolver(requirementSchema),
        defaultValues: {
            location: "",
            min_budget: "",
            max_budget: "",
            property_type: "any",
            bedrooms: "any",
            bathrooms: "any",
            notes: "",
        },
    });

    // Fetch Requirements
    const { data: requirements = [], isLoading: reqLoading } = useQuery({
        queryKey: ["property_requirements"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("property_requirements")
                .select("*")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });

    // Fetch Saved Properties
    const { data: savedProperties = [], isLoading: savedLoading } = useQuery({
        queryKey: ["saved_properties"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("saved_properties")
                .select("property_id")
                .order("created_at", { ascending: false });

            if (error) throw error;

            // Map saved IDs to actual property data
            // In a real app, you'd likely fetch the property details from the DB too.
            // Here we map back to the static data for display purposes
            const savedIds = data.map(item => item.property_id);
            return properties.filter(p => savedIds.includes(p.id));
        },
        enabled: !!user,
    });

    // Add Requirement Mutation
    const addRequirementMutation = useMutation({
        mutationFn: async (values: z.infer<typeof requirementSchema>) => {
            if (!user) throw new Error("Not authenticated");

            const { error } = await supabase.from("property_requirements").insert({
                user_id: user.id,
                location: values.location,
                min_budget: values.min_budget ? Number(values.min_budget) : null,
                max_budget: values.max_budget ? Number(values.max_budget) : null,
                property_type: values.property_type === "any" ? null : values.property_type,
                bedrooms: values.bedrooms === "any" ? null : Number(values.bedrooms),
                bathrooms: values.bathrooms === "any" ? null : Number(values.bathrooms),
                notes: values.notes || null,
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["property_requirements"] });
            toast.success("Requirement posted successfully!");
            form.reset();
        },
        onError: (error) => {
            toast.error("Failed to post requirement: " + error.message);
        },
    });

    // Delete Requirement Mutation
    const deleteRequirementMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from("property_requirements")
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["property_requirements"] });
            toast.success("Requirement removed");
        },
    });

    const onSubmit = (values: z.infer<typeof requirementSchema>) => {
        addRequirementMutation.mutate(values);
    };

    if (authLoading) {
        return (
            <Layout>
                <div className="container py-20 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    if (!user) return null;

    return (
        <Layout>
            <div className="container py-10 min-h-[80vh]">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">
                            My <span className="text-primary">Dashboard</span>
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your property preferences and saved listings
                        </p>
                    </div>
                    <Button variant="outline" onClick={async () => {
                        await signOut();
                        // Force complete page reload with replace to clear all state
                        window.location.replace("/");
                    }}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>

                <Tabs defaultValue="requirements" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="requirements">My Requirements</TabsTrigger>
                        <TabsTrigger value="saved">Saved Properties</TabsTrigger>
                    </TabsList>

                    {/* Requirements Tab */}
                    <TabsContent value="requirements" className="space-y-6">
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Form Column */}
                            <div className="md:col-span-1">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Post New Requirement</CardTitle>
                                        <CardDescription>
                                            Let us know what you're looking for, and we'll help you find it.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                                <FormField
                                                    control={form.control}
                                                    name="location"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Location / Area</FormLabel>
                                                            <FormControl>
                                                                <div className="relative">
                                                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                    <Input placeholder="e.g. Downtown, Suburbs" className="pl-9" {...field} />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="min_budget"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Min Budget</FormLabel>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                        <Input type="number" placeholder="0" className="pl-9" {...field} />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="max_budget"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Max Budget</FormLabel>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                        <Input type="number" placeholder="Max" className="pl-9" {...field} />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="property_type"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Type</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Any" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="any">Any</SelectItem>
                                                                        <SelectItem value="house">House</SelectItem>
                                                                        <SelectItem value="apartment">Apartment</SelectItem>
                                                                        <SelectItem value="condo">Condo</SelectItem>
                                                                        <SelectItem value="townhouse">Townhouse</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="bedrooms"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Beds</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Any" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="any">Any</SelectItem>
                                                                        <SelectItem value="1">1+</SelectItem>
                                                                        <SelectItem value="2">2+</SelectItem>
                                                                        <SelectItem value="3">3+</SelectItem>
                                                                        <SelectItem value="4">4+</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>

                                                <FormField
                                                    control={form.control}
                                                    name="notes"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Additional Notes</FormLabel>
                                                            <FormControl>
                                                                <Textarea
                                                                    placeholder="Specific features like pool, garden, etc."
                                                                    className="resize-none"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <Button type="submit" className="w-full" disabled={addRequirementMutation.isPending}>
                                                    {addRequirementMutation.isPending && (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    )}
                                                    Post Requirement
                                                </Button>
                                            </form>
                                        </Form>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* List Column */}
                            <div className="md:col-span-2 space-y-4">
                                <h3 className="text-xl font-semibold">Posted Requirements</h3>
                                {reqLoading ? (
                                    <div className="flex justify-center py-10">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : requirements.length === 0 ? (
                                    <Card className="bg-muted/50 border-dashed">
                                        <CardContent className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                                            <Search className="h-10 w-10 mb-4 opacity-50" />
                                            <p>You haven't posted any requirements yet.</p>
                                            <p className="text-sm">Fill out the form to let us know what you need.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="space-y-4">
                                        {requirements.map((req: PropertyRequirement) => (
                                            <Card key={req.id}>
                                                <CardHeader className="pb-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <CardTitle className="text-lg flex items-center gap-2">
                                                                <MapPin className="h-4 w-4 text-primary" />
                                                                {req.location}
                                                            </CardTitle>
                                                            <CardDescription>
                                                                Posted on {format(new Date(req.created_at), "PPP")}
                                                            </CardDescription>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                            onClick={() => deleteRequirementMutation.mutate(req.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
                                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                                            <IndianRupee className="h-4 w-4" />
                                                            <span>
                                                                {req.min_budget ? `₹${req.min_budget.toLocaleString()}` : "0"} -
                                                                {req.max_budget ? `₹${req.max_budget.toLocaleString()}` : "Any"}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                                            <Building className="h-4 w-4" />
                                                            <span className="capitalize">{req.property_type || "Any Type"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                                            <BedDouble className="h-4 w-4" />
                                                            <span>{req.bedrooms || "Any"} Beds</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                                            <Bath className="h-4 w-4" />
                                                            <span>{req.bathrooms || "Any"} Baths</span>
                                                        </div>
                                                    </div>
                                                    {req.notes && (
                                                        <div className="bg-muted/50 p-3 rounded-md text-sm">
                                                            <span className="font-semibold block mb-1 text-xs uppercase tracking-wider text-muted-foreground">Notes</span>
                                                            {req.notes}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Saved Properties Tab */}
                    <TabsContent value="saved">
                        {savedLoading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : savedProperties.length === 0 ? (
                            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed">
                                <h3 className="text-lg font-semibold mb-2">No Saved Properties</h3>
                                <p className="text-muted-foreground mb-6">You haven't saved any properties yet.</p>
                                <Button asChild>
                                    <Link to="/buy">Browse Properties</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {savedProperties.map((property) => (
                                    <PropertyCard key={property.id} property={property} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
}
