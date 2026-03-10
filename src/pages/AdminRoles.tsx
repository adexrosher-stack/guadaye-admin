import { useEffect, useMemo, useState } from "react";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldCheck, Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Permission = {
  key: string;
  label: string;
};

type Role = {
  id: number | string;
  name: string;
  permissions: string[];
};

const normalizePermissions = (raw: any): Permission[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p: any) => {
      // Supports strings, { key, label }, or Spatie Permission objects { id, name, ... }
      if (typeof p === "string") {
        return { key: p, label: p.replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) };
      }
      const key = p?.key ?? p?.name ?? "";
      const label = p?.label ?? (typeof p?.name === "string" ? p.name.replace(/\./g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()) : key);
      return { key, label } as Permission;
    })
    .filter((p: Permission) => p.key);
};

const toDisplayRole = (item: any, index: number): Role => ({
  id: item?.id ?? index,
  name: item?.name ?? "Unnamed",
  permissions: Array.isArray(item?.permissions)
    ? item.permissions
        .map((p: any) => (typeof p === "string" ? p : (p?.key ?? p?.name)))
        .filter(Boolean)
    : [],
});

const AdminRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [roleName, setRoleName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);
  const filteredRoles = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return roles;
    return roles.filter((r) => r.name.toLowerCase().includes(term));
  }, [roles, debouncedSearch]);

  const fetchPermissions = async () => {
    try {
      // Permissions are paginated; request a large page to get most/all
      const res = await apiClient.get("/permissions", { params: { per_page: 1000 } });
      const items = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      setPermissions(normalizePermissions(items));
    
    } catch (e: any) {
      // Non-fatal; show empty permissions if API not ready
      setPermissions([]);
    }
  };

  const fetchRoles = async (page: number = 1, search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/roles", {
        params: { page, per_page: 15, search: search || undefined },
      });
      const payload = res.data;
      const items = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : []);
      setRoles(items.map(toDisplayRole));
      setCurrentPage(payload?.current_page ?? 1);
      setLastPage(payload?.last_page ?? 1);
      setTotalCount(payload?.total ?? items.length);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load roles");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setMode("create");
    setEditingId(null);
    setRoleName("");
    setSelectedPerms({});
    setIsDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    setMode("edit");
    setEditingId(role.id);
    setRoleName(role.name);
    const map: Record<string, boolean> = {};
    for (const k of role.permissions) map[k] = true;
    setSelectedPerms(map);
    setIsDialogOpen(true);
  };

  const togglePermission = (key: string, checked: boolean | string) => {
    setSelectedPerms((prev) => ({ ...prev, [key]: !!checked }));
  };

  const submitRole = async () => {
    if (!roleName.trim()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        name: roleName.trim(),
        permissions: Object.keys(selectedPerms).filter((k) => selectedPerms[k]),
      };
      if (mode === "create") {
        const res = await apiClient.post("/roles", payload);
        const created = res?.data;
        toast.success("Role created", {
          description: `${created?.name ?? "New role"} • ${(created?.permissions?.length ?? 0)} permissions`,
        });
      } else if (editingId !== null) {
        const res = await apiClient.put(`/roles/${editingId}`, payload);
        const updated = res?.data;
        toast.success("Role updated", {
          description: `${updated?.name ?? "Role"} • ${(updated?.permissions?.length ?? 0)} permissions`,
        });
      }
      setIsDialogOpen(false);
      await fetchRoles(currentPage, searchTerm);
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Unable to save role";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRole = async (id: number | string) => {
    try {
      await apiClient.delete(`/roles/${id}`);
      // If deleting last item on the page, adjust page back if needed
      const nextPage = roles.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      await fetchRoles(nextPage, searchTerm);
      toast.success("Role deleted");
    } catch (e) {
      // could show a toast error
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    fetchRoles(currentPage, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">User Management - Admin Roles</h2>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> New Role
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Manage access and permissions</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => { setCurrentPage(1); setSearchTerm(e.target.value); }}
                placeholder="Search roles..."
                className="pl-8 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-3 text-sm text-red-600">{error}</p>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3}>Loading...</TableCell>
                </TableRow>
              ) : filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">No roles found.</TableCell>
                </TableRow>
              ) : (
                filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 text-xs">
                        {role.permissions.length === 0 ? (
                          <span className="text-muted-foreground">None</span>
                        ) : (
                          role.permissions.map((p) => (
                            <span key={p} className="rounded bg-muted px-2 py-0.5">{p}</span>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(role)}>
                          <Edit className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteId(role.id)}>
                              <Trash2 className="mr-1 h-4 w-4" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete role?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the role "{role.name}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteRole(role.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {lastPage > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Total: {totalCount}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Prev</Button>
            <span className="text-sm">Page {currentPage} / {lastPage}</span>
            <Button variant="outline" size="sm" disabled={currentPage >= lastPage} onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}>Next</Button>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Create Role" : "Edit Role"}</DialogTitle>
            <DialogDescription>
              Define the role name and assign permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Role Name</label>
              <Input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="e.g., Super Admin"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Permissions</p>
              {permissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No permissions available.</p>
              ) : (
                <PermissionsGrouped
                  permissions={permissions}
                  selectedPerms={selectedPerms}
                  onToggle={togglePermission}
                  onSelectGroup={(groupKeys) => {
                    setSelectedPerms((prev) => ({ ...prev, ...Object.fromEntries(groupKeys.map((k) => [k, true])) }));
                  }}
                  onClearGroup={(groupKeys) => {
                    setSelectedPerms((prev) => {
                      const next = { ...prev };
                      for (const k of groupKeys) delete next[k];
                      return next;
                    });
                  }}
                />
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={submitRole} disabled={isSubmitting || !roleName.trim()}>
                {mode === "create" ? "Create" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component to group permissions by prefix before first dot
const PermissionsGrouped = ({
  permissions,
  selectedPerms,
  onToggle,
  onSelectGroup,
  onClearGroup,
}: {
  permissions: Permission[];
  selectedPerms: Record<string, boolean>;
  onToggle: (key: string, checked: boolean | string) => void;
  onSelectGroup: (groupKeys: string[]) => void;
  onClearGroup: (groupKeys: string[]) => void;
}) => {
  const groups = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    const [prefix] = p.key.split(".");
    const group = prefix || "general";
    (acc[group] = acc[group] || []).push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([group, list]) => {
        const keys = list.map((p) => p.key);
        const allSelected = keys.every((k) => !!selectedPerms[k]);
        const anySelected = keys.some((k) => !!selectedPerms[k]);
        return (
          <div key={group} className="rounded border p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium capitalize">{group.replace(/[-_]/g, " ")}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onSelectGroup(keys)}>
                  Select all
                </Button>
                <Button variant="outline" size="sm" onClick={() => onClearGroup(keys)} disabled={!anySelected}>
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {list.map((perm) => (
                <label key={perm.key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={!!selectedPerms[perm.key]}
                    onCheckedChange={(v) => onToggle(perm.key, v)}
                  />
                  <span>{perm.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{perm.key}</span>
                </label>
              ))}
            </div>
            {allSelected && (
              <p className="mt-2 text-xs text-muted-foreground">All permissions in this group selected.</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdminRoles;

