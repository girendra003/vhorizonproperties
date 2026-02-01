
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Download,
  Search,
  Mail,
  Phone,
  Calendar,
  Home,
  MessageSquare,
  Loader2,
  LogOut,
  Check,
  Clock,
  AlertCircle,
  LayoutDashboard,
  Building2,
  FileText
} from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useRequireAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import AdminProperties from "@/components/admin/AdminProperties";
import AdminRequirements from "@/components/admin/AdminRequirements";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  property_id: number | null;
  property_title: string | null;
  message: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
}

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin, signOut } = useRequireAuth(true);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!user && isAdmin,
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (status === "resolved") {
        const { error } = await supabase
          .from("leads")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("leads")
          .update({ status })
          .eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      if (variables.status === "resolved") {
        toast.success("Lead resolved and removed");
      } else {
        toast.success("Lead status updated");
      }
    },
    onError: () => {
      toast.error("Failed to update lead");
    },
  });

  const filteredLeads = leads.filter((lead) => {
    const matchSearch =
      !search ||
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.property_title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || lead.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Property", "Message", "Status", "Date"];
    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.email,
      lead.phone,
      lead.property_title || "",
      lead.message || "",
      lead.status || "new",
      format(new Date(lead.created_at), "yyyy-MM-dd"),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "contacted":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" /> Contacted
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="default" className="gap-1 bg-success">
            <Check className="h-3 w-3" /> Resolved
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <AlertCircle className="h-3 w-3" /> New
          </Badge>
        );
    }
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

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page.
          </p>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10 min-h-[90vh]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Site
            </Link>
            <h1 className="text-3xl font-bold">
              Admin <span className="text-primary">Dashboard</span>
            </h1>
          </div>
          <Button variant="outline" onClick={async () => {
            await signOut();
            // Hard refresh to ensure all state is cleared
            window.location.href = "/";
          }}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
            <TabsTrigger value="leads" className="gap-2">
              <LayoutDashboard className="h-4 w-4" /> Leads
            </TabsTrigger>
            <TabsTrigger value="properties" className="gap-2">
              <Building2 className="h-4 w-4" /> Properties
            </TabsTrigger>
            <TabsTrigger value="requirements" className="gap-2">
              <FileText className="h-4 w-4" /> Requirements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-xl border border-border">
                <p className="text-muted-foreground">No leads found</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <a
                              href={`mailto:${lead.email}`}
                              className="flex items-center gap-1 text-sm hover:text-primary"
                            >
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </a>
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-1 text-sm hover:text-primary"
                            >
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.property_title ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Home className="h-3 w-3" />
                              {lead.property_title}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              General Inquiry
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(lead.status)}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(lead.created_at), "MMM d, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={lead.status || "new"}
                              onValueChange={(value) =>
                                updateLeadMutation.mutate({ id: lead.id, status: value })
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
                            {lead.message && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MessageSquare className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Message from {lead.name}</DialogTitle>
                                  </DialogHeader>
                                  <p className="text-muted-foreground">{lead.message}</p>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="properties">
            <AdminProperties />
          </TabsContent>

          <TabsContent value="requirements">
            <AdminRequirements />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

