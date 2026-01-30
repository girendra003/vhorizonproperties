
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import PropertyCard from "@/components/PropertyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    MapPin,
    Search,
    SlidersHorizontal,
    Coffee,
    Wifi,
    Car,
    Clock,
    Calendar,
    Star,
    Sparkles
} from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { Property } from "@/lib/types";

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

import { Helmet } from "react-helmet-async";

export default function StaysPage() {
    const { properties } = useProperties();
    const [search, setSearch] = useState("");
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [perTimeFilter, setPerTimeFilter] = useState<"all" | "night" | "hour">("all");

    // Filter properties for "Stays"
    const staysProperties = useMemo(() => {
        return properties.filter(p => p.status === "stay");
    }, [properties]); // Added dependency

    const filteredStays = useMemo(() => {
        return staysProperties.filter(p => {
            const matchSearch = p.location.toLowerCase().includes(search.toLowerCase()) ||
                p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.area.toLowerCase().includes(search.toLowerCase());
            const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
            const matchTime = perTimeFilter === "all" || p.perTime === perTimeFilter;

            return matchSearch && matchPrice && matchTime;
        });
    }, [staysProperties, search, priceRange, perTimeFilter]);

    return (
        <Layout>
            <Helmet>
                <title>Luxury Stays & Short Term Rentals in Delhi NCR | V Horizon Stays</title>
                <meta name="description" content="Experience premium short-term rentals and luxury stays in Delhi NCR. Book by the hour or night. Hotel comfort with home privacy for business and leisure." />
                <link rel="canonical" href="https://vhorizonproperties.in/stays" />
            </Helmet>
            <div className="min-h-screen bg-background">
                {/* Hero Section */}
                <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?q=80&w=2000"
                            alt="Luxury Stays"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    </div>

                    <div className="relative z-10 container text-center text-white space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <Badge variant="secondary" className="mb-4 px-4 py-1 text-xs uppercase tracking-widest bg-white/20 hover:bg-white/30 backdrop-blur-md border-white/20 text-white">
                                <Sparkles className="w-3 h-3 mr-2 text-yellow-300" />
                                Premium Short-Term Rentals
                            </Badge>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">
                                Find Your Haven
                            </h1>
                            <p className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
                                Flexible stays for modern living. Rent by the hour, night, or day.
                            </p>
                        </motion.div>

                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-full max-w-3xl mx-auto flex flex-col md:flex-row gap-2 shadow-2xl"
                        >
                            <div className="flex-1 relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70 group-focus-within:text-white transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Where do you want to stay?"
                                    className="w-full bg-transparent border-none text-white placeholder:text-white/60 focus:ring-0 pl-12 h-12 text-lg outline-none"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button size="lg" className="rounded-full bg-white text-black hover:bg-white/90 px-8 h-12 text-lg font-medium transition-transform hover:scale-105 active:scale-95">
                                Search
                            </Button>
                        </motion.div>
                    </div>
                </section>

                {/* Filters & Content */}
                <section className="container py-16">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                        <div>
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                                Curated Spaces
                            </h2>
                            <p className="text-muted-foreground mt-2">
                                {filteredStays.length} premium properties available for your dates
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg backdrop-blur-sm border border-border">
                                <Button
                                    variant={perTimeFilter === "all" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setPerTimeFilter("all")}
                                    className="rounded-md"
                                >
                                    All
                                </Button>
                                <Button
                                    variant={perTimeFilter === "night" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setPerTimeFilter("night")}
                                    className="rounded-md"
                                >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Overnight
                                </Button>
                                <Button
                                    variant={perTimeFilter === "hour" ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setPerTimeFilter("hour")}
                                    className="rounded-md"
                                >
                                    <Clock className="w-4 h-4 mr-2" />
                                    Hourly
                                </Button>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredStays.map((property) => (
                            <motion.div key={property.id} variants={itemVariants}>
                                <PropertyCard property={property} />
                            </motion.div>
                        ))}
                    </motion.div>

                    {filteredStays.length === 0 && (
                        <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-muted-foreground/30">
                            <Search className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-xl font-semibold text-foreground">No stays found</h3>
                            <p className="text-muted-foreground max-w-md mx-auto mt-2">
                                We couldn't find any properties matching your criteria. Try adjusting your search location or filters.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-8"
                                onClick={() => { setSearch(""); setPerTimeFilter("all"); }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </section>

                {/* Features Section */}
                <section className="bg-muted/30 py-20 border-t border-border/50">
                    <div className="container">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold mb-4">Why Choose Our Stays?</h2>
                            <p className="text-muted-foreground text-lg">
                                Experience the perfect blend of hotel hospitality and home comfort.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: <Clock className="h-8 w-8 text-primary" />,
                                    title: "Flexible Booking",
                                    desc: "Book by the hour or day. Pay only for the time you need."
                                },
                                {
                                    icon: <Wifi className="h-8 w-8 text-primary" />,
                                    title: "Work-Ready Spaces",
                                    desc: "High-speed internet and ergonomic workstations in every unit."
                                },
                                {
                                    icon: <Star className="h-8 w-8 text-primary" />,
                                    title: "Premium Quality",
                                    desc: "Professionally managed, verified, and cleaned to hotel standards."
                                }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -5 }}
                                    className="bg-background p-8 rounded-2xl border border-border/50 shadow-lg hover:shadow-xl transition-all"
                                >
                                    <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
}
