import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { getLocalizedValue } from "@/lib/i18n";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Edit, Trash2, Package, List, LayoutGrid } from "lucide-react";
import AddIngredientForm from "@/components/AddIngredientForm";

const Ingredients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [editingInitial, setEditingInitial] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importImagesZip, setImportImagesZip] = useState<File | null>(null);
  const [mode, setMode] = useState<"create" | "edit">("create");

  type IngredientDisplay = {
    id: number | string;
    name: string;
    description: string;
    measurement_unit: string;
    rawName?: any;
    rawDescription?: any;
    icon?: string;
    is_produced?: boolean;
  };

  const [ingredients, setIngredients] = useState<IngredientDisplay[]>([]);

  const toDisplayIngredient = (item: any, index: number): IngredientDisplay => ({
    id: item?.id ?? index,
    name: getLocalizedValue(item?.name) || "Unnamed",
    description: getLocalizedValue(item?.description) || "",
    measurement_unit: item?.measurement_unit ?? "",
    rawName: item?.name ?? {},
    rawDescription: item?.description ?? {},
    icon: item?.icon ?? null,
    is_produced: item?.is_produced ?? false,
  });

  const openEditDialog = (ingredient: IngredientDisplay) => {
    setEditingId(ingredient.id);
    setMode("edit");
    setIsDialogOpen(true);
    const name = ingredient.rawName ?? {};
    const description = ingredient.rawDescription ?? {};
    setEditingInitial({
      en: { name: name.en ?? "", description: description.en ?? "" },
      am: { name: name.am ?? "", description: description.am ?? "" },
      or: { name: name.or ?? "", description: description.or ?? "" },
      ti: { name: name.ti ?? "", description: description.ti ?? "" },
      so: { name: name.so ?? "", description: description.so ?? "" },
      measurement_unit: ingredient.measurement_unit ?? "",
      iconUrl: ingredient.icon ?? null,
      is_produced: ingredient.is_produced ?? false,
    });
  };

  const fetchIngredients = async (page: number = 1, search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/food-ingredients", {
        params: { page, search: search || undefined },
      });
      const payload = response.data;
      const items = payload?.data ?? [];
      const mapped: IngredientDisplay[] = items.map(toDisplayIngredient);
      setIngredients(mapped);
      setCurrentPage(payload?.current_page ?? 1);
      setLastPage(payload?.last_page ?? 1);
      setTotalCount(payload?.total ?? mapped.length);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load ingredients");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm), 1000);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ingredients</h2>
          <p className="text-muted-foreground">Manage your food ingredients and measurements</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsImportDialogOpen(true)}
          >
            Import
          </Button>
          <Button
            className="flex items-center gap-2"
            onClick={() => {
              setMode("create");
              setEditingId(null);
              setEditingInitial(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add New Ingredient
          </Button>
        </div>
      </div>

      {/* Search + View Mode */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === "grid" ? "table" : "grid")}
              className="flex items-center gap-2"
            >
              {viewMode === "grid" ? (
                <>
                  <List className="h-4 w-4" />
                  List View
                </>
              ) : (
                <>
                  <LayoutGrid className="h-4 w-4" />
                  Grid View
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog for Create/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === "edit" ? "Edit Ingredient" : "Add New Ingredient"}</DialogTitle>
            <DialogDescription>
              {mode === "edit"
                ? "Update ingredient details."
                : "Create a new ingredient with multilingual support."}
            </DialogDescription>
          </DialogHeader>
          <AddIngredientForm
            submitLabel={mode === "edit" ? "Update Ingredient" : "Create Ingredient"}
            isSubmitting={isSubmitting}
            initialValues={editingInitial ?? undefined}
            onSubmit={async (data) => {
              setIsSubmitting(true);
              try {
                const form = new FormData();

                if (mode === "edit") {
                  form.append("_method", "PUT");
                }

                Object.entries(data?.name || {}).forEach(([lang, value]) => {
                  form.append(`name[${lang}]`, String(value || ""));
                });

                Object.entries(data?.description || {}).forEach(([lang, value]) => {
                  form.append(`description[${lang}]`, String(value || ""));
                });

                if (data?.measurement_unit) {
                  form.append("measurement_unit", data.measurement_unit);
                }

                if (typeof data?.is_produced !== "undefined") {
                  form.append("is_produced", data.is_produced ? "1" : "0");
                }

                if (data?.icon instanceof File) {
                  form.append("icon", data.icon);
                }

                if (mode === "edit" && editingId) {
                  await apiClient.post(`/food-ingredients/${editingId}`, form, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                } else {
                  await apiClient.post("/food-ingredients", form, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                }

                await fetchIngredients(currentPage, debouncedSearch);
                setIsDialogOpen(false);
                setEditingId(null);
                setEditingInitial(null);
              } catch (error) {
                console.error("Failed to save ingredient:", error);
              } finally {
                setIsSubmitting(false);
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog for Import */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Ingredients</DialogTitle>
            <DialogDescription>
              Upload a spreadsheet (xlsx, xls, csv) and a ZIP file of images.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Spreadsheet File</label>
              <Input
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Images ZIP</label>
              <Input
                type="file"
                accept=".zip,application/zip,application/x-zip-compressed"
                onChange={(e) => setImportImagesZip(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)} disabled={isImporting}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!importFile || !importImagesZip) {
                    alert("Please select both files.");
                    return;
                  }
                  setIsImporting(true);
                  try {
                    const form = new FormData();
                    form.append("file", importFile);
                    form.append("images_zip", importImagesZip);
                    await apiClient.post("/food-ingredients/import", form, {
                      headers: { "Content-Type": "multipart/form-data" },
                    });
                    await fetchIngredients(1, debouncedSearch);
                    setCurrentPage(1);
                    setIsImportDialogOpen(false);
                    setImportFile(null);
                    setImportImagesZip(null);
                  } catch (e: any) {
                    console.error("Failed to import ingredients:", e);
                    alert(e?.response?.data?.message || e?.message || "Import failed");
                  } finally {
                    setIsImporting(false);
                  }
                }}
                disabled={isImporting}
              >
                {isImporting ? "Importing..." : "Start Import"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error & Loading */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">Loading ingredients...</CardContent>
        </Card>
      )}
      {error && (
        <Card>
          <CardContent className="p-6 text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Ingredients View */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ingredient) => (
            <Card key={ingredient.id} className="overview-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {ingredient.icon ? (
                      <img
                        src={ingredient.icon}
                        alt={ingredient.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <CardTitle className="text-lg">{ingredient.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{ingredient.description}</p>
                {ingredient.measurement_unit && (
                  <p className="text-xs text-blue-600 font-medium mb-4">
                    Unit: {ingredient.measurement_unit}
                  </p>
                )}
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(ingredient)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this ingredient?")) {
                        try {
                          await apiClient.delete(`/food-ingredients/${ingredient.id}`);
                          await fetchIngredients(currentPage, debouncedSearch);
                        } catch (e) {
                          console.error("Failed to delete ingredient", e);
                        }
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Ingredients ({totalCount})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icon</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ingredient) => (
                  <TableRow key={ingredient.id}>
                    <TableCell>
                      {ingredient.icon ? (
                        <img
                          src={ingredient.icon}
                          alt={ingredient.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-primary" />
                      )}
                    </TableCell>
                    <TableCell>{ingredient.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{ingredient.description}</TableCell>
                    <TableCell>
                      {ingredient.measurement_unit && (
                        <span className="text-sm text-blue-600 font-medium">
                          {ingredient.measurement_unit}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(ingredient)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete this ingredient?")) {
                            try {
                              await apiClient.delete(`/food-ingredients/${ingredient.id}`);
                              await fetchIngredients(currentPage, debouncedSearch);
                            } catch (e) {
                              console.error("Failed to delete ingredient", e);
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                  }
                }}
                disabled={currentPage <= 1 || isLoading}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {lastPage}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  if (currentPage < lastPage) {
                    setCurrentPage(currentPage + 1);
                  }
                }}
                disabled={currentPage >= lastPage || isLoading}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Ingredients;
