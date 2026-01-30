export interface Property {
  id: number;
  title: string;
  location: string;
  area: string;
  price: number;
  type: "villa" | "penthouse" | "estate" | "commercial" | "residential" | "studio";
  status: "sale" | "rent" | "lease" | "stay";
  beds: number;
  baths: number;
  sqft: number;
  carpetArea?: number;
  superArea?: number;
  currentRent?: number;
  amenities: string[];
  heroImage: string;
  gallery: string[];
  description: string;
  agentId: string;
  virtualTourUrl?: string;
  createdAt?: string;
  perTime?: "night" | "hour" | "day" | "month";
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  image: string;
  phone: string;
  email: string;
  bio?: string;
}

export interface Lead {
  id?: string;
  name: string;
  email: string;
  phone: string;
  property_id?: number;
  property_title?: string;
  message?: string;
  created_at?: string;
  status?: "new" | "contacted" | "resolved";
  notes?: string;
}

export interface FilterState {
  search: string;
  type: "all" | "villa" | "penthouse" | "estate" | "commercial" | "residential" | "studio";
  status: "all" | "sale" | "rent" | "lease" | "stay";
  maxPrice: number;
  minBeds: number;
  minBaths: number;
  minSqft: number;
  maxSqft: number;
  amenities: string[];
}

export interface SortOption {
  value: string;
  label: string;
}

export interface AppConfig {
  locale: string;
  currency: string;
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  quote: string;
  rating: number;
  propertyType?: string;
}

export interface NewsletterSubscriber {
  id?: string;
  email: string;
  created_at?: string;
  status?: "active" | "unsubscribed";
}

export interface PropertyRequirement {
  id: string;
  location: string;
  created_at: string;
  status: string;
  property_type?: string;
  min_budget?: number;
  max_budget?: number;
  bedrooms?: number;
  bathrooms?: number;
  notes?: string;
  user_id?: string;
}