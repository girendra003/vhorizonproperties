
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Property } from "@/lib/types";

const propertySchema = z.object({
    title: z.string().min(5, "Title is required"),
    location: z.string().min(2, "Location is required"),
    area: z.string().min(2, "Area is required"),
    price: z.coerce.number().min(0),
    type: z.enum(["villa", "penthouse", "estate", "commercial", "residential", "studio"]),
    status: z.enum(["sale", "rent", "lease", "stay"]),
    beds: z.coerce.number().min(0),
    baths: z.coerce.number().min(0),
    sqft: z.coerce.number().min(0),
    description: z.string().min(10),
    heroImage: z.string().optional(),
    gallery: z.array(z.string()).optional(),
});

interface PropertyFormProps {
    open: boolean;
    onClose: () => void;
    property?: Property | null;
}

export default function PropertyForm({ open, onClose, property }: PropertyFormProps) {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const form = useForm<z.infer<typeof propertySchema>>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            title: "",
            location: "",
            area: "",
            price: 0,
            type: "residential",
            status: "sale",
            beds: 0,
            baths: 0,
            sqft: 0,
            description: "",
            heroImage: "",
            gallery: [],
        },
    });

    useEffect(() => {
        if (property) {
            form.reset({
                title: property.title,
                location: property.location,
                area: property.area,
                price: property.price,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: property.type as any,
                status: property.status,
                beds: property.beds,
                baths: property.baths,
                sqft: property.sqft,
                description: property.description,
                heroImage: property.heroImage,
                gallery: property.gallery || [],
            });
            if (property.gallery) {
                setUploadedUrls(property.gallery);
            } else if (property.heroImage) {
                setUploadedUrls([property.heroImage]);
            }
        } else {
            form.reset({
                title: "",
                location: "",
                area: "",
                price: 0,
                type: "residential",
                status: "sale",
                beds: 0,
                baths: 0,
                sqft: 0,
                description: "",
                heroImage: "",
                gallery: [],
            });
            setUploadedUrls([]);
            setImageFiles([]);
        }
    }, [property, form, open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setImageFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const removeUrl = (index: number) => {
        setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async (propertyTitle: string) => {
        if (imageFiles.length === 0) return [];

        setUploading(true);
        const urls: string[] = [];
        const sanitizedTitle = propertyTitle.toLowerCase().replace(/[^a-z0-9]/g, "-");

        // Start count from existing urls length + 1
        const startCount = uploadedUrls.length + 1;

        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `images/${sanitizedTitle}/${startCount + i}.${fileExt}`;

            try {
                const { error: uploadError } = await supabase.storage
                    .from('property-images')
                    .upload(fileName, file, {
                        upsert: true
                    });

                if (uploadError) {
                    // Try fallback 'images' bucket if 'property-images' fails
                    const { error: fallbackError } = await supabase.storage
                        .from('images')
                        .upload(fileName, file, {
                            upsert: true
                        });

                    if (fallbackError) {
                        console.error("Upload failed", uploadError, fallbackError);
                        continue;
                    }

                    const { data } = supabase.storage.from('images').getPublicUrl(fileName);
                    urls.push(data.publicUrl);
                } else {
                    const { data } = supabase.storage.from('property-images').getPublicUrl(fileName);
                    urls.push(data.publicUrl);
                }

                setUploadProgress(Math.round(((i + 1) / imageFiles.length) * 100));

            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }

        setUploading(false);
        return urls;
    };

    const mutation = useMutation({
        mutationFn: async (values: z.infer<typeof propertySchema>) => {
            // Upload images first
            const newImageUrls = await uploadImages(values.title);
            const allUrls = [...uploadedUrls, ...newImageUrls];

            // Set hero image to first image if available
            const heroImage = allUrls.length > 0 ? allUrls[0] : values.heroImage;

            // Map form values to database column names (snake_case)
            const dbValues = {
                title: values.title,
                location: values.location,
                area: values.area,
                price: values.price,
                type: values.type,
                status: values.status,
                beds: values.beds,
                baths: values.baths,
                sqft: values.sqft,
                description: values.description,
                hero_image: heroImage,
                gallery: allUrls,
                agent_id: "ag_02", // Default to admin agent for now
            };

            if (property) {
                // Update
                const { error } = await supabase
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .from("properties" as any)
                    .update(dbValues)
                    .eq("id", property.id);
                if (error) throw error;
            } else {
                // Insert
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error } = await supabase.from("properties" as any).insert(dbValues);
                if (error) throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin_properties"] });
            toast.success(property ? "Property updated" : "Property added");
            onClose();
        },
        onError: (error) => {
            toast.error("Error: " + error.message);
            setUploading(false);
        },
    });

    const onSubmit = async (values: z.infer<typeof propertySchema>) => {
        mutation.mutate(values);
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{property ? "Edit Property" : "Add New Property"}</DialogTitle>
                    <DialogDescription>
                        Fill in the details below. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Property Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Luxury Villa in suburbs..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>City / Location</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ghaziabad" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="area"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Area / Locality</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Crossings Republik" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="residential">Residential</SelectItem>
                                                <SelectItem value="commercial">Commercial</SelectItem>
                                                <SelectItem value="villa">Villa</SelectItem>
                                                <SelectItem value="penthouse">Penthouse</SelectItem>
                                                <SelectItem value="estate">Estate</SelectItem>
                                                <SelectItem value="studio">Studio</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="sale">For Sale</SelectItem>
                                                <SelectItem value="rent">For Rent</SelectItem>
                                                <SelectItem value="lease">For Lease</SelectItem>
                                                <SelectItem value="stay">Stay</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="beds"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Beds</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="baths"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Baths</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="sqft"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sq.Ft</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-2 border rounded-md p-4 bg-muted/20">
                            <FormLabel className="block mb-2">Property Images</FormLabel>

                            {/* Existing Images */}
                            {uploadedUrls.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    {uploadedUrls.map((url, i) => (
                                        <div key={i} className="relative group aspect-square rounded-md overflow-hidden bg-background border">
                                            <img src={url} alt={`Property ${i + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeUrl(i)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New Files Preview */}
                            {imageFiles.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    <div className="text-xs text-muted-foreground font-medium">To be uploaded:</div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {imageFiles.map((file, i) => (
                                            <div key={i} className="relative group aspect-square rounded-md overflow-hidden bg-background border">
                                                <div className="w-full h-full flex items-center justify-center text-xs text-center p-1 text-muted-foreground">
                                                    {file.name}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(i)}
                                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-center w-full">
                                <label
                                    htmlFor="dropzone-file"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold">Click to upload</span> images
                                        </p>
                                        <p className="text-xs text-muted-foreground">JPG, PNG (MAX. 5MB)</p>
                                    </div>
                                    <input
                                        id="dropzone-file"
                                        type="file"
                                        className="hidden"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detailed property description..."
                                            className="resize-none h-32"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={mutation.isPending || uploading}>
                                {(mutation.isPending || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {uploading ? `Uploading ${uploadProgress}%...` : property ? "Save Changes" : "Create Property"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
