"use client";

import { useNavigate, useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  MapPin,
  UtensilsCrossed,
  Clock,
  DollarSign,
  MoreVertical,
  ChefHat,
  Store,
  X,
  Users,
  Package,
  LayoutGrid,
  Calendar,
} from "lucide-react";

import CreateBranchForm from "@/pages/company/CreateBranchPage";

/* =======================
   Types
======================= */
type BranchType = "restaurant" | "main_kitchen" | "main_store";

interface Branch {
  id: string;
  name: string;
  location: string;
  type: BranchType;
  operatingHours?: string;
  currency: string;
  isOpen: boolean;
  staffCount?: number;
  itemCount?: number;
  tableCount?: number;
}

/* =======================
   Branch Type Config
======================= */
const BRANCH_TYPE_CONFIG: Record<
  BranchType,
  { label: string; icon: JSX.Element }
> = {
  restaurant: {
    label: "Restaurant",
    icon: <UtensilsCrossed className="h-4 w-4 mr-2" />,
  },
  main_kitchen: {
    label: "Main Kitchen",
    icon: <ChefHat className="h-4 w-4 mr-2" />,
  },
  main_store: {
    label: "Main Store",
    icon: <Store className="h-4 w-4 mr-2" />,
  },
};

/* =======================
   Management Modules
======================= */
const managementModules = [
  {
    id: "menu",
    title: "Menu Management",
    description: "Update food & drinks",
    icon: UtensilsCrossed,
    allowedTypes: ["restaurant"],
  },
  {
    id: "tables",
    title: "Table Management",
    description: "Organize seating",
    icon: LayoutGrid,
    allowedTypes: ["restaurant"], 
  },
  {
    id: "shift",
    title: "Shift Management",
    description: "Manage employee shifts",
    icon: Calendar,
    allowedTypes: ["restaurant", "main_kitchen", "main_store"],
  },
  {
    id: "employees",
    title: "Employee Management",
    description: "Manage staff & roles",
    icon: Users,
    allowedTypes: ["restaurant", "main_kitchen", "main_store"],
  },
];

export default function CompanyBranches() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [createBranchType, setCreateBranchType] =
    useState<BranchType>("restaurant");
  const [searchTerm, setSearchTerm] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    location: "",
    type: "restaurant" as BranchType,
    operatingHours: "",
    currency: "ETB",
    isOpen: true,
  });

  const [branches, setBranches] = useState<Branch[]>([
    {
      id: "1",
      name: "Rosher Burgers",
      location: "Sebeta",
      type: "restaurant",
      operatingHours: "09:00 - 17:00",
      currency: "ETB",
      isOpen: true,
      staffCount: 8,
      itemCount: 12,
      tableCount: 7,
    },
    {
      id: "2",
      name: "Central Store",
      location: "Garment",
      type: "main_store",
      currency: "ETB",
      isOpen: true,
      staffCount: 4,
      itemCount: 30,
    },
  ]);

  /* =======================
     Handlers
  ======================= */
  const handleDelete = (branchId: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== branchId));
    if (selectedBranch?.id === branchId) setSelectedBranch(null);
  };

  const handleCreateBranch = (data: any) => {
    setBranches((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: data.name,
        location: data.location,
        type: createBranchType,
        operatingHours: `${data.openTime} - ${data.closeTime}`,
        currency: data.currency,
        isOpen: true,
      },
    ]);
  };

  const handleUpdateBranch = () => {
    if (!editBranch) return;

    setBranches((prev) =>
      prev.map((b) =>
        b.id === editBranch.id
          ? {
              ...b,
              name: editForm.name,
              location: editForm.location,
              type: editForm.type,
              operatingHours: editForm.operatingHours,
              currency: editForm.currency,
              isOpen: editForm.isOpen,
            }
          : b
      )
    );

    if (selectedBranch?.id === editBranch.id) {
      setSelectedBranch({
        ...selectedBranch,
        name: editForm.name,
        location: editForm.location,
        type: editForm.type,
        operatingHours: editForm.operatingHours,
        currency: editForm.currency,
        isOpen: editForm.isOpen,
      });
    }

    setIsEditOpen(false);
    setEditBranch(null);
  };

  const visibleModules = selectedBranch
    ? managementModules.filter((m) =>
        m.allowedTypes.includes(selectedBranch.type)
      )
    : [];

  /* =======================
     Render
  ======================= */
  return (
    <div className="flex gap-6">
      {/* ================= Main Content ================= */}
      <div className={`space-y-6 ${selectedBranch ? "flex-1" : "w-full"}`}>
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
  <h2 className="text-2xl font-semibold">Branch Management</h2>

  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
    <Link
      to={`/company`}
      className="hover:text-foreground transition-colors"
    >
      Dashboard
    </Link>

    <span>›</span>

    <Link
      to={`/company/${id}/branches`}
      className="text-primary hover:underline"
    >
      Branch
    </Link>
  </div>
</div>


          {/* Create Buttons */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(BRANCH_TYPE_CONFIG) as BranchType[]).map((type) => (
              <Button
                key={type}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => {
                  setCreateBranchType(type);
                  setIsCreateOpen(true);
                }}
              >
                {BRANCH_TYPE_CONFIG[type].icon}
                Create {BRANCH_TYPE_CONFIG[type].label}
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-80">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm"
                  placeholder="Search branches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-64">Branch</TableHead>
                    <TableHead className="w-40">Location</TableHead>
                    <TableHead className="w-40">Type</TableHead>
                    <TableHead className="w-40">Status</TableHead>
                    <TableHead className="w-44">Staff</TableHead>
                    <TableHead className="w-44">Items</TableHead>
                    <TableHead className="w-44">Tables</TableHead>
                    <TableHead className="w-12 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(branches.filter(b => {
                    const q = searchTerm.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      b.name.toLowerCase().includes(q) ||
                      b.location.toLowerCase().includes(q) ||
                      BRANCH_TYPE_CONFIG[b.type].label.toLowerCase().includes(q)
                    );
                  })).map((branch) => (
                    <TableRow
                      key={branch.id}
                      className="hover:bg-muted/60 transition-colors cursor-pointer"
                      onClick={() => setSelectedBranch(branch)}
                    >
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell className="text-muted-foreground">{branch.location}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-2">
                          {BRANCH_TYPE_CONFIG[branch.type].icon}
                          {BRANCH_TYPE_CONFIG[branch.type].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={branch.isOpen ? "bg-green-100 text-green-800 border-green-300" : "bg-gray-100 text-gray-800 border-gray-300"}
                          variant="outline"
                        >
                          {branch.isOpen ? "Open" : "Closed"}
                        </Badge>
                      </TableCell>
                      <TableCell>{branch.staffCount ?? 0}</TableCell>
                      <TableCell>{branch.itemCount ?? 0}</TableCell>
                      <TableCell>{branch.tableCount ?? 0}</TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditBranch(branch);
                              setEditForm({
                                name: branch.name,
                                location: branch.location,
                                type: branch.type,
                                operatingHours: branch.operatingHours ?? "",
                                currency: branch.currency,
                                isOpen: branch.isOpen,
                              });
                              setIsEditOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(branch.id);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= Side Panel ================= */}
      {selectedBranch && (
        <div className="w-80 shrink-0 space-y-4 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Manage <strong>{selectedBranch.name}</strong>
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedBranch(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Card className="bg-gradient-to-br from-orange-400 to-orange-500 text-white">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold">{selectedBranch.name}</h3>
              <p className="text-sm">{selectedBranch.location}</p>

              <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                <div>
                  <Users className="mx-auto mb-1 h-5 w-5" />
                  {selectedBranch.staffCount || 0}
                </div>
                <div>
                  <Package className="mx-auto mb-1 h-5 w-5" />
                  {selectedBranch.itemCount || 0}
                </div>
                <div>
                  <LayoutGrid className="mx-auto mb-1 h-5 w-5" />
                  {selectedBranch.tableCount || 0}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules */}
          <div>
            <div className="flex justify-between mb-3">
              <h4 className="font-medium">Branch Management</h4>
              <span className="text-xs text-orange-500">
                {visibleModules.length} Modules
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {visibleModules.map((module) => (
                <Card
                  key={module.id}
                  className="cursor-pointer hover:shadow-md"
                  onClick={() => {
                    if (module.id === "menu") {
                      navigate(
                        `/company/${id}/branches/${selectedBranch.id}/menu-management`
                      );
                    }
                    if (module.id === "tables") {
                      navigate(
                        `/company/${id}/branches/${selectedBranch.id}/table-management`
                      );
                    }
                    if (module.id === "shift") {
                      navigate(
                        `/company/${id}/branches/${selectedBranch.id}/shift-management`
                      );
                    }
                    if (module.id === "employees") {
                      navigate(
                        `/company/${id}/branches/${selectedBranch.id}/staff`
                      );
                    }
                  }}
                >
                  <CardContent className="p-4 text-center">
                    <module.icon className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm font-medium">{module.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {module.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= Create Drawer ================= */}
      <div
        className={`fixed inset-0 z-50 ${
          isCreateOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            isCreateOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsCreateOpen(false)}
        />

        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl
          transform transition-transform duration-300 ${
            isCreateOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold">
              Create {BRANCH_TYPE_CONFIG[createBranchType].label}
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6 overflow-y-auto h-[calc(100%-64px)]">
            <CreateBranchForm
              branchType={createBranchType}
              onSubmit={handleCreateBranch}
              onSuccess={() => setIsCreateOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* ================= Edit Drawer ================= */}
      <div
        className={`fixed inset-0 z-50 ${
          isEditOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            isEditOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsEditOpen(false)}
        />

        <div
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl
          transform transition-transform duration-300 ${
            isEditOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold">Edit Branch</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsEditOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6 overflow-y-auto h-[calc(100%-64px)] space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                value={editForm.location}
                onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={editForm.type}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    type: e.target.value as BranchType,
                  }))
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {(Object.keys(BRANCH_TYPE_CONFIG) as BranchType[]).map((type) => (
                  <option key={type} value={type}>
                    {BRANCH_TYPE_CONFIG[type].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operating Hours</label>
              <input
                value={editForm.operatingHours}
                onChange={(e) => setEditForm((prev) => ({ ...prev, operatingHours: e.target.value }))}
                placeholder="09:00 - 17:00"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <input
                value={editForm.currency}
                onChange={(e) => setEditForm((prev) => ({ ...prev, currency: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="branch-is-open"
                type="checkbox"
                checked={editForm.isOpen}
                onChange={(e) => setEditForm((prev) => ({ ...prev, isOpen: e.target.checked }))}
                className="h-4 w-4 text-orange-600 border-gray-300 rounded"
              />
              <label htmlFor="branch-is-open" className="text-sm text-gray-700">
                Open now
              </label>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (editBranch) handleDelete(editBranch.id);
                  setIsEditOpen(false);
                }}
              >
                Delete
              </Button>
              <Button className="flex-1" onClick={handleUpdateBranch}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
