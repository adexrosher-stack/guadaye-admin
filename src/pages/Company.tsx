import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "@/lib/api";
import { format, differenceInDays, parseISO } from "date-fns";
import {
  Building2, Plus, Search, MoreVertical, Copy, Edit, Trash2, Info, Globe, MapPin, Palette,
  Facebook, Instagram, Twitter, Linkedin, Phone, User, Briefcase, AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import CompanyOverview1 from "@/pages/company/CompanyOverview1";

// ────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────
export type CompanyItem = {
  id: number | string;
  name: string;
  tin?: string;
  company_website?: string;
  company_logo?: string;
  package?: string;
  packageId?: string;
  expiresAt?: string;
  activatedAt?: string;
  created_at: string;
  updated_at?: string;
  // Not in API yet → will be placeholders / hardcoded for now
  status?: "Active" | "Suspended" | "Trial" | "Terminated";
};

const Company = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Suspended" | "Trial" | "Terminated">("All");

  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState<CompanyItem | null>(null);
  const [companyDrawerOpen, setCompanyDrawerOpen] = useState(false);

  const [selectedAdminCompany, setSelectedAdminCompany] = useState<CompanyItem | null>(null);
  const [adminDrawerOpen, setAdminDrawerOpen] = useState(false);

  const [selectedStatusCompany, setSelectedStatusCompany] = useState<CompanyItem | null>(null);
  const [statusDrawerOpen, setStatusDrawerOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  const [subscriptionDrawerOpen, setSubscriptionDrawerOpen] = useState(false);
  const [now] = useState(new Date());
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedDetailsCompany, setSelectedDetailsCompany] = useState<CompanyItem | null>(null);
  const [overviewDrawerOpen, setOverviewDrawerOpen] = useState(false);
  const [selectedOverviewCompany, setSelectedOverviewCompany] = useState<CompanyItem | null>(null);

  // ─── Mock data for fields not in API yet ────────────────────────────────
  const getMockCompanyData = (company: CompanyItem) => ({
    region: "Addis Ababa",
    city: "Addis Ababa",
    woreda: "Bole",
    houseNumber: "1234",
    businessLicense: "https://via.placeholder.com/400x300?text=Business+License",
    primaryColor: "#3b82f6",
    socialMedia: [
      { platform: "Facebook", url: "https://facebook.com/company", icon: Facebook },
      { platform: "Instagram", url: "https://instagram.com/company", icon: Instagram },
    ],
  });

  const getMockAdminData = () => ({
    name: "Abebe Kebede",
    phone: "+251 911 234 567",
    location: "Bole, Addis Ababa",
    role: "Company Admin",
  });

  // ─── Subscription helpers ───────────────────────────────────────────────
  const getSubscriptionInfo = (expiresAt?: string) => {
    if (!expiresAt) return { text: "No expiry", color: "gray" };

    const daysLeft = Math.floor(
      (new Date(expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysLeft < 0) return { text: "Expired", color: "gray" };
    if (daysLeft <= 10) return { text: `${daysLeft} days remaining`, color: "red" };
    return { text: `${daysLeft} days remaining`, color: "green" };
  };

  // Hardcoded live countdown component (24 days)
  const LiveCountdown = () => {
    const totalDays = 90;
    const [remaining, setRemaining] = useState(24 * 24 * 60 * 60); // 24 days in seconds
    useEffect(() => {
      const id = setInterval(() => {
        setRemaining(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(id);
    }, []);
    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((remaining % (60 * 60)) / 60);
    const seconds = remaining % 60;
    const color =
      remaining <= 0 ? "text-gray-600" : days <= 10 ? "text-red-600" : "text-green-600";
    const dot =
      remaining <= 0 ? "⚫" : days <= 10 ? "🔴" : "🟢";
    const usedDays = totalDays - Math.min(days, totalDays);
    return (
      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium">
          <span role="img" aria-label="status-dot">{dot}</span>{" "}
          {remaining > 0
            ? <span className={color}>{days}d {hours}h {minutes}m {seconds}s remaining</span>
            : <span className={color}>Expired</span>}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Auto-updates every second
        </div>
      </div>
    );
  };

  // ─── Fetching ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get("/companies", { params: { per_page: 50 } });
        const items = res.data?.data ?? [];
        const mapped = items.map((it: any) => ({
          id: it.id,
          name: it.name ?? "Unnamed",
          tin: it.tin ?? "",
          company_website: it.company_website ?? "",
          company_logo: it.company_logo ?? "",
          package: it.package ?? "Basic",
          expiresAt: it.expiresAt,
          activatedAt: it.activatedAt,
          created_at: it.created_at,
          status: ["Active", "Suspended", "Trial", "Terminated"][Math.floor(Math.random() * 4)] as any,
        }));
        setCompanies(mapped);
      } catch (err) {
        console.error(err);
        toast({ variant: "destructive", title: "Failed to load companies" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // ─── Client-side filtering + debounce ───────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    let result = [...companies];

    // Search filter
    if (debouncedSearch) {
      result = result.filter(c =>
        c.name.toLowerCase().includes(debouncedSearch) ||
        (c.tin || "").toLowerCase().includes(debouncedSearch)
        // Admin phone would be added here when real data exists
      );
    }

    // Status filter
    if (statusFilter !== "All") {
      result = result.filter(c => c.status === statusFilter);
    }

    setFilteredCompanies(result);
  }, [companies, debouncedSearch, statusFilter]);

  // ─── Handlers ───────────────────────────────────────────────────────────
  const openCompanyDrawer = (company: CompanyItem) => {
    setSelectedCompany(company);
    setCompanyDrawerOpen(true);
  };

  const openAdminDrawer = (company: CompanyItem) => {
    setSelectedAdminCompany(company);
    setAdminDrawerOpen(true);
  };

  const openStatusDrawer = (company: CompanyItem) => {
    setSelectedStatusCompany(company);
    setNewStatus(company.status || "Active");
    setStatusDrawerOpen(true);
  };

  const confirmStatusChange = () => {
    if (!selectedStatusCompany) return;

    // TODO: API call here in real version
    setCompanies(prev =>
      prev.map(c =>
        c.id === selectedStatusCompany.id ? { ...c, status: newStatus as any } : c
      )
    );

    toast({ title: "Status updated", description: `Changed to ${newStatus}` });
    setStatusDrawerOpen(false);
  };

  const openDetailsDrawer = (company: CompanyItem) => {
    setSelectedDetailsCompany(company);
    setDetailsDrawerOpen(true);
  };
  const openOverviewDrawer = (company: CompanyItem) => {
    setSelectedOverviewCompany(company);
    setOverviewDrawerOpen(true);
  };

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Company Management</h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or TIN..."
              className="pl-9"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
              <SelectItem value="Trial">Trial</SelectItem>
              <SelectItem value="Terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
          
          <Button className="sm:ml-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Company
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Companies ({filteredCompanies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-72">Company</TableHead>
                  <TableHead className="w-44">TIN Number</TableHead>
                  <TableHead className="w-44">Admin No</TableHead>
                  <TableHead className="w-56">Subscription</TableHead>
                  <TableHead className="w-36">Status</TableHead>
                  <TableHead className="w-12 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">Loading...</TableCell>
                  </TableRow>
                ) : filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No companies found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map(company => {
                    const sub = getSubscriptionInfo(company.expiresAt);
                    const statusColor = {
                      Active: "bg-green-100 text-green-800 border-green-300",
                      Suspended: "bg-red-100 text-red-800 border-red-300",
                      Trial: "bg-amber-100 text-amber-800 border-amber-300",
                      Terminated: "bg-gray-100 text-gray-800 border-gray-300",
                    }[company.status || "Active"];

                    return (
                      <TableRow
                        key={company.id}
                        className="group hover:bg-muted/60 transition-colors"
                      >
                        {/* Company (clickable) */}
                        <TableCell
                          className="cursor-pointer"
                          onClick={() => openCompanyDrawer(company)}
                        >
                          <div className="flex items-center gap-3">
                            {company.company_logo ? (
                              <img
                                src={company.company_logo}
                                alt={company.name}
                                className="h-10 w-10 rounded-md object-cover border"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                <Building2 className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="font-medium">{company.name}</div>
                          </div>
                        </TableCell>

                        {/* TIN */}
                        <TableCell>
                          {company.tin ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className="inline-flex items-center gap-1.5 font-mono text-sm cursor-pointer hover:underline"
                                    onClick={() => {
                                      navigator.clipboard.writeText(company.tin!);
                                      toast({ title: "TIN copied" });
                                    }}
                                  >
                                    {company.tin}
                                    <Copy className="h-3.5 w-3.5 opacity-60" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>Click to copy TIN</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            "—"
                          )}
                        </TableCell>

                        {/* Admin No (clickable) */}
                        <TableCell
                          className="cursor-pointer font-mono text-sm hover:underline"
                          onClick={() => openAdminDrawer(company)}
                        >
                          +251 9•• ••• ••68
                        </TableCell>

                        {/* Subscription (hardcoded UI) */}
                        <TableCell
                          className="cursor-pointer"
                          onClick={() => setSubscriptionDrawerOpen(true)}
                        >
                          <div className="flex flex-col gap-1">
                            <Badge className="w-fit">Premium</Badge>
                            <div className="text-sm font-medium">
                              <span role="img" aria-label="green">🟢</span> 24 days remaining
                            </div>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell
                          className="cursor-pointer"
                          onClick={() => openStatusDrawer(company)}
                        >
                          <Badge
                            variant="outline"
                            className={cn(
                              "transition-all duration-300 hover:scale-105",
                              statusColor
                            )}
                          >
                            {company.status || "Active"}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openOverviewDrawer(company);
                                }}
                              >
                                Company Overview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDetailsDrawer(company)}>
                                Company Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/company/${company.id}/branches`)}>
                                Company Branches
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Company Sidebar ──────────────────────────────────────────────── */}
      <Drawer open={companyDrawerOpen} onOpenChange={setCompanyDrawerOpen}>
        <DrawerContent className="max-w-2xl ml-auto h-full border-l">
          {selectedCompany && (
            <>
              <DrawerHeader>
                <DrawerTitle className="text-2xl">{selectedCompany.name}</DrawerTitle>
              </DrawerHeader>

              <div className="p-6 space-y-8 overflow-y-auto">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Company Name</div>
                      <div>{selectedCompany.name}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">TIN Number</div>
                      <div>{selectedCompany.tin || "—"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Website</div>
                      <div>{selectedCompany.company_website || "—"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Region</div>
                      <div>{getMockCompanyData(selectedCompany).region}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">City</div>
                      <div>{getMockCompanyData(selectedCompany).city}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Woreda</div>
                      <div>{getMockCompanyData(selectedCompany).woreda}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">House Number</div>
                      <div>{getMockCompanyData(selectedCompany).houseNumber}</div>
                    </div>
                  </div>
                </div>

                {/* Assets */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Assets</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Company Logo</div>
                      {selectedCompany.company_logo ? (
                        <img src={selectedCompany.company_logo} alt="Logo" className="h-32 w-32 object-contain border rounded" />
                      ) : (
                        <div className="h-32 w-32 bg-muted rounded flex items-center justify-center">
                          <Building2 className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Business License</div>
                      <img
                        src={getMockCompanyData(selectedCompany).businessLicense}
                        alt="License"
                        className="h-32 w-full object-cover rounded border"
                      />
                    </div>
                  </div>
                </div>

                {/* Branding */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Branding</h3>
                  <div className="flex items-center gap-4">
                    <div
                      className="h-12 w-12 rounded border shadow-sm"
                      style={{ backgroundColor: getMockCompanyData(selectedCompany).primaryColor }}
                    />
                    <div>
                      <div className="font-medium">Primary Color</div>
                      <div className="text-sm text-muted-foreground">
                        {getMockCompanyData(selectedCompany).primaryColor}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Social Media</h3>
                  <div className="space-y-3">
                    {getMockCompanyData(selectedCompany).socialMedia.map((sm, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <sm.icon className="h-5 w-5" />
                        <a
                          href={sm.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {sm.platform}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* ── Admin Sidebar (hardcoded) ──────────────────────────────────────── */}
      <Drawer open={adminDrawerOpen} onOpenChange={setAdminDrawerOpen}>
        <DrawerContent className="max-w-md ml-auto h-full border-l">
          {selectedAdminCompany && (
            <>
              <DrawerHeader>
                <DrawerTitle>Admin Information</DrawerTitle>
              </DrawerHeader>
              <div className="p-6 space-y-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-10 w-10 text-primary" />
                    <div>
                      <div className="font-medium">{getMockAdminData().name}</div>
                      <div className="text-sm text-muted-foreground">{getMockAdminData().role}</div>
                    </div>
                  </div>

                  <div className="grid gap-4 text-sm">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>{getMockAdminData().phone}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>{getMockAdminData().location}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* ── Status Change Sidebar ──────────────────────────────────────────── */}
      <Drawer open={statusDrawerOpen} onOpenChange={setStatusDrawerOpen}>
        <DrawerContent className="max-w-md ml-auto h-full border-l">
          {selectedStatusCompany && (
            <>
              <DrawerHeader>
                <DrawerTitle>Change Company Status</DrawerTitle>
                <DrawerDescription>
                  Current status: <strong>{selectedStatusCompany.status}</strong>
                </DrawerDescription>
              </DrawerHeader>

              <div className="p-6 space-y-6 overflow-y-auto">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Trial">Trial</SelectItem>
                    <SelectItem value="Terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setStatusDrawerOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={confirmStatusChange}>
                    Confirm Change
                  </Button>
                </div>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <Drawer open={detailsDrawerOpen} onOpenChange={setDetailsDrawerOpen}>
        <DrawerContent className="max-w-2xl ml-auto h-full border-l">
          {selectedDetailsCompany && (
            <>
              <DrawerHeader>
                <DrawerTitle className="text-2xl">{selectedDetailsCompany.name}</DrawerTitle>
                <DrawerDescription>
                  {selectedDetailsCompany.company_website || "—"}
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-6 space-y-8 overflow-y-auto">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "transition-all duration-300",
                      {
                        Active: "bg-green-100 text-green-800 border-green-300",
                        Suspended: "bg-red-100 text-red-800 border-red-300",
                        Trial: "bg-amber-100 text-amber-800 border-amber-300",
                        Terminated: "bg-gray-100 text-gray-800 border-gray-300",
                      }[selectedDetailsCompany.status || "Active"]
                    )}
                  >
                    {selectedDetailsCompany.status || "Active"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">Package</div>
                    <div className="flex items-center gap-2">
                      <Badge className="w-fit">{selectedDetailsCompany.package || "Premium"}</Badge>
                      <div className="text-sm">
                        {getSubscriptionInfo(selectedDetailsCompany.expiresAt).text}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">Activation</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border p-3">
                        <div className="text-xs text-muted-foreground">Activated</div>
                        <div className="font-medium">
                          {selectedDetailsCompany.activatedAt
                            ? format(new Date(selectedDetailsCompany.activatedAt), "MMM dd, yyyy")
                            : "—"}
                        </div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-xs text-muted-foreground">Expires</div>
                        <div className="font-medium">
                          {selectedDetailsCompany.expiresAt
                            ? format(new Date(selectedDetailsCompany.expiresAt), "MMM dd, yyyy")
                            : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Time Used</span>
                    <span className="font-medium">
                      {(() => {
                        const a = selectedDetailsCompany.activatedAt;
                        const e = selectedDetailsCompany.expiresAt;
                        if (a && e) {
                          const ad = parseISO(a);
                          const ed = parseISO(e);
                          const total = Math.max(1, differenceInDays(ed, ad));
                          const used = Math.max(0, Math.min(total, differenceInDays(now, ad)));
                          return `${used}d / ${total}d`;
                        }
                        return "—";
                      })()}
                    </span>
                  </div>
                  <Progress
                    value={(() => {
                      const a = selectedDetailsCompany.activatedAt;
                      const e = selectedDetailsCompany.expiresAt;
                      if (a && e) {
                        const ad = parseISO(a);
                        const ed = parseISO(e);
                        const total = Math.max(1, differenceInDays(ed, ad));
                        const used = Math.max(0, Math.min(total, differenceInDays(now, ad)));
                        return Math.round((used / total) * 100);
                      }
                      return 0;
                    })()}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">TIN Number</div>
                    <div>{selectedDetailsCompany.tin || "—"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Website</div>
                    <div>{selectedDetailsCompany.company_website || "—"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Region</div>
                    <div>{getMockCompanyData(selectedDetailsCompany).region}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">City</div>
                    <div>{getMockCompanyData(selectedDetailsCompany).city}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Woreda</div>
                    <div>{getMockCompanyData(selectedDetailsCompany).woreda}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">House Number</div>
                    <div>{getMockCompanyData(selectedDetailsCompany).houseNumber}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Admins", value: 2, sub: "max users" },
                      { label: "Cashiers", value: 3, sub: "max users" },
                      { label: "Waiters", value: 20, sub: "max users" },
                      { label: "Managers", value: 3, sub: "max users" },
                      { label: "Backup Duration", value: "12", sub: "days" },
                      { label: "Support Response", value: "6", sub: "hrs" },
                      { label: "Account Manager", value: "Yes", sub: "assigned" },
                    ].map((it, i) => (
                      <div key={i} className="rounded-lg border p-4">
                        <div className="text-xs text-muted-foreground">{it.label}</div>
                        <div className="text-2xl font-bold">{it.value}</div>
                        <div className="text-xs text-muted-foreground">{it.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <ul className="space-y-2 text-sm">
                    {[
                      "Customer Order",
                      "Kitchen Display",
                      "Inventory Tracking",
                      "Staff Scheduling",
                      "Basic Analytics",
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-green-600">✔</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="sticky bottom-0 bg-background pt-4 border-t flex gap-3">
                  <Button variant="outline" className="flex-1">Change Package</Button>
                  <Button className="flex-1">Renew Subscription</Button>
                </div>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* ── Subscription Drawer (hardcoded) ──────────────────────────────── */}
      <Drawer open={subscriptionDrawerOpen} onOpenChange={setSubscriptionDrawerOpen}>
        <DrawerContent className="max-w-xl ml-auto h-full border-l">
          <DrawerHeader>
            <DrawerTitle>Premium Plan</DrawerTitle>
            <DrawerDescription>0 ETB / Month</DrawerDescription>
          </DrawerHeader>
          <div className="p-6 space-y-8 overflow-y-auto">
            {/* Status */}
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-700 border-green-300">Active</Badge>
              <span className="text-sm text-muted-foreground">Subscription is currently active</span>
            </div>

            {/* Live Countdown */}
            <LiveCountdown />

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time Used</span>
                <span className="font-medium">66d / 90d</span>
              </div>
              <Progress value={73} />
              <div className="text-xs text-muted-foreground">Turns red when ≤ 10 days remaining</div>
            </div>

            {/* Activation Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <div className="text-xs text-muted-foreground">Activated</div>
                <div className="font-medium">Jan 10, 2026</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="text-xs text-muted-foreground">Expires</div>
                <div className="font-medium">Apr 10, 2026</div>
              </div>
            </div>

            {/* Limits & Capacities */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Limits & Capacities</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Admins", value: 2, sub: "max users" },
                  { label: "Cashiers", value: 3, sub: "max users" },
                  { label: "Waiters", value: 20, sub: "max users" },
                  { label: "Managers", value: 3, sub: "max users" },
                  { label: "Backup Duration", value: "12", sub: "days" },
                  { label: "Support Response", value: "6", sub: "hrs" },
                  { label: "Account Manager", value: "Yes", sub: "assigned" },
                ].map((it, i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="text-xs text-muted-foreground">{it.label}</div>
                    <div className="text-2xl font-bold">{it.value}</div>
                    <div className="text-xs text-muted-foreground">{it.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Included Features */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Included Features</h3>
              <ul className="space-y-2 text-sm">
                {[
                  "Customer Order",
                  "Kitchen Display",
                  "Inventory Tracking",
                  "Staff Scheduling",
                  "Basic Analytics",
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-green-600">✔</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-background pt-4 border-t flex gap-3">
              <Button variant="outline" className="flex-1">Change Package</Button>
              <Button className="flex-1">Renew Subscription</Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={overviewDrawerOpen} onOpenChange={setOverviewDrawerOpen}>
        <DrawerContent className="max-w-3xl ml-auto h-full border-l">
          {selectedOverviewCompany && (
            <div className="p-4 overflow-y-auto h-full">
              <CompanyOverview1 companyId={String(selectedOverviewCompany.id)} />
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Company;
