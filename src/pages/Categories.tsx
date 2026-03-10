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
import { Plus, Search, Edit, Trash2, FolderOpen, List, LayoutGrid } from "lucide-react";
import AddCategoryForm from "@/components/AddCategoryForm";

const Categories = () => {
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

  type CategoryDisplay = {
    id: number | string;
    name: string;
    description: string;
    rawName?: any;
    rawDescription?: any;
    image?: string;
  };

  const [categories, setCategories] = useState<CategoryDisplay[]>([]);

  const getOtherLocalizedNames = (raw: any): Array<{ lang: string; value: string }> => {
    if (!raw || typeof raw !== "object") return [];
    const entries = Object.entries(raw as Record<string, string>)
      .filter(([lang, val]) => lang !== "en" && typeof val === "string" && val?.trim())
      .map(([lang, val]) => ({ lang, value: val as string }));
    return entries as Array<{ lang: string; value: string }>;
  };

  const toDisplayCategory = (item: any, index: number): CategoryDisplay => ({
    id: item?.id ?? index,
    name: getLocalizedValue(item?.name) || "Unnamed",
    description: getLocalizedValue(item?.description) || "",
    rawName: item?.name ?? {},
    rawDescription: item?.description ?? {},
    image: item?.image ?? null,
  });

  const openEditDialog = (category: CategoryDisplay) => {
    setEditingId(category.id);
    setMode("edit");
    setIsDialogOpen(true);
    const name = category.rawName ?? {};
    const description = category.rawDescription ?? {};
    setEditingInitial({
      en: { name: name.en ?? "", description: description.en ?? "" },
      am: { name: name.am ?? "", description: description.am ?? "" },
      or: { name: name.or ?? "", description: description.or ?? "" },
      ti: { name: name.ti ?? "", description: description.ti ?? "" },
      so: { name: name.so ?? "", description: description.so ?? "" },
      imageUrl: category.image ?? null,
    });
  };

  const fetchCategories = async (page: number = 1, search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/menu-categories", {
        params: { page, search: search || undefined },
      });
      console.log(response);
      const payload = response.data;
      const items = payload?.data ?? [];
      const mapped: CategoryDisplay[] = items.map(toDisplayCategory);
      setCategories(mapped);
      setCurrentPage(payload?.current_page ?? 1);
      setLastPage(payload?.last_page ?? 1);
      setTotalCount(payload?.total ?? mapped.length);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(currentPage, debouncedSearch);
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
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Organize your menu items into categories</p>
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
            Add New Category
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
                placeholder="Search categories..."
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === "edit" ? "Edit Category" : "Add New Category"}</DialogTitle>
            <DialogDescription>
              {mode === "edit"
                ? "Update category details."
                : "Create a new category with multilingual support."}
            </DialogDescription>
          </DialogHeader>
          <AddCategoryForm
            submitLabel={mode === "edit" ? "Update Category" : "Create Category"}
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

                if (data?.image instanceof File) {
                  form.append("image", data.image);
                }

                if (mode === "edit" && editingId) {
                  await apiClient.post(`/menu-categories/${editingId}`, form, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                } else {
                  await apiClient.post("/menu-categories", form, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                }

                await fetchCategories(currentPage, debouncedSearch);
                setIsDialogOpen(false);
                setEditingId(null);
                setEditingInitial(null);
              } catch (error) {
                console.error("Failed to save category:", error);
              } finally {
                setIsSubmitting(false);
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog for Import */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Categories</DialogTitle>
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
                    await apiClient.post("/menu-categories/import", form, {
                      headers: { "Content-Type": "multipart/form-data" },
                    });
                    await fetchCategories(1, debouncedSearch);
                    setCurrentPage(1);
                    setIsImportDialogOpen(false);
                    setImportFile(null);
                    setImportImagesZip(null);
                  } catch (e: any) {
                    console.error("Failed to import categories:", e);
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
          <CardContent className="p-6">Loading categories...</CardContent>
        </Card>
      )}
      {error && (
        <Card>
          <CardContent className="p-6 text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Categories View */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="overview-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                    ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    )}
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {getOtherLocalizedNames(category.rawName).length > 0 && (
                  <div className="text-xs text-muted-foreground mb-2 space-x-2">
                    {getOtherLocalizedNames(category.rawName).map((n) => (
                      <span key={n.lang} className="inline-block">
                        <span className="uppercase text-[10px] mr-1">{n.lang}:</span>
                        <span>{n.value}</span>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this category?")) {
                        try {
                          await apiClient.delete(`/menu-categories/${category.id}`);
                          await fetchCategories(currentPage, debouncedSearch);
                        } catch (e) {
                          console.error("Failed to delete category", e);
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
            <CardTitle>All Categories ({totalCount})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <FolderOpen className="h-5 w-5 text-primary" />
                      )}
                    </TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete this category?")) {
                            try {
                              await apiClient.delete(`/menu-categories/${category.id}`);
                              await fetchCategories(currentPage, debouncedSearch);
                            } catch (e) {
                              console.error("Failed to delete category", e);
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

export default Categories;
