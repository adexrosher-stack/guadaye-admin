import { useEffect, useState, useRef } from "react";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Upload, 
  Search, 
  Trash2, 
  ImageIcon,
  Filter,
  Grid3X3,
  List,
  Edit,
  Plus,
} from "lucide-react";

// Icons resource: Route::apiResource('icons', IconController::class)
// Model $fillable: ['icon', 'tags'] where tags is a comma-separated string

type IconDisplay = {
  id: number | string;
  icon: string | null;
  tags: string[];
};

const MediaLibrary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [icons, setIcons] = useState<IconDisplay[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formIconFile, setFormIconFile] = useState<File | null>(null);
  const [formTags, setFormTags] = useState<string>("");

  // Drag & Drop state
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toDisplayIcon = (item: any): IconDisplay => ({
    id: item?.id,
    icon: item?.icon ?? null,
    tags:
      typeof item?.tags === "string"
        ? item.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter((t: string) => t.length > 0)
        : Array.isArray(item?.tags)
        ? item.tags
        : [],
  });

  const fetchIcons = async (page: number = 1, search?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/icons", {
        params: { page, search: search || undefined },
      });
      const payload = response.data;
      const items = payload?.data ?? payload ?? [];
      const mapped: IconDisplay[] = items.map(toDisplayIcon);
      setIcons(mapped);
      setCurrentPage(payload?.current_page ?? 1);
      setLastPage(payload?.last_page ?? 1);
      setTotalCount(payload?.total ?? mapped.length);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load icons");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm), 600);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchIcons(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  const openCreateDialog = () => {
    setMode("create");
    setEditingId(null);
    setFormIconFile(null);
    setFormTags("");
    setPreviewUrl(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (iconItem: IconDisplay) => {
    setMode("edit");
    setEditingId(iconItem.id);
    setFormIconFile(null);
    setFormTags(iconItem.tags.join(", "));
    setPreviewUrl(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const form = new FormData();
      if (mode === "edit") {
        form.append("_method", "PUT");
      }
      if (formIconFile instanceof File) {
        form.append("icon", formIconFile);
      }
      form.append("tags", formTags);

      if (mode === "edit" && editingId) {
        await apiClient.post(`/icons/${editingId}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await apiClient.post("/icons", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      await fetchIcons(currentPage, debouncedSearch);
      setIsDialogOpen(false);
      setFormIconFile(null);
      setFormTags("");
      setPreviewUrl(null);
      setEditingId(null);
    } catch (err) {
      console.error("Failed to save icon", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Drag & Drop handlers
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFormIconFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormIconFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const editingItem = mode === "edit" ? icons.find((i) => i.id === editingId) : null;
  const existingIconUrl = editingItem?.icon ? editingItem.icon : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Media Library</h2>
          <p className="text-muted-foreground">Manage and tag your icons</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) { setIsDragging(false); setPreviewUrl(null); setFormIconFile(null); } }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Add Icon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{mode === "edit" ? "Edit Icon" : "Add New Icon"}</DialogTitle>
              <DialogDescription>
                {mode === "edit" ? "Update the icon and tags." : "Upload an icon and set its tags."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Icon</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={onPickFile} className="hidden" />
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}`}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <img src={previewUrl} alt="preview" className="h-full w-full object-cover" />
                      ) : existingIconUrl ? (
                        <img src={existingIconUrl} alt="current icon" className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Drag & drop an image here</p>
                      <p className="text-xs text-muted-foreground">or click to browse</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <Input placeholder="e.g. food, vegan, spicy" value={formTags} onChange={(e) => setFormTags(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {mode === "edit" ? "Update Icon" : "Create Icon"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="overview-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Icons</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card className="overview-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tagged Icons</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{icons.filter(i => i.tags.length > 0).length}</div>
          </CardContent>
        </Card>
        <Card className="overview-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Untagged Icons</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{icons.filter(i => i.tags.length === 0).length}</div>
          </CardContent>
        </Card>
        <Card className="overview-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Tags</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.from(new Set(icons.flatMap(i => i.tags))).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and View Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search icons..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <div className="flex border rounded-lg">
                <Button 
                  variant={viewMode === "grid" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "list" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error & Loading */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">Loading icons...</CardContent>
        </Card>
      )}
      {error && (
        <Card>
          <CardContent className="p-6 text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Icons Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {icons.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-muted flex items-center justify-center">
                {item.icon ? (
                  <img
                    src={item.icon}
                    alt="icon"
                    className="h-full w-full object-cover"
                  />
                ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags.length > 0 ? (
                    item.tags.map((tag, idx) => (
                      <Badge key={`${item.id}-tag-${idx}`} variant="secondary" className="text-xs">{tag}</Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs">No tags</Badge>
                    )}
                  </div>
                <div className="flex items-center justify-end gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                    <Edit className="h-3 w-3" />
                    </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={async () => {
                      if (confirm("Delete this icon?")) {
                        try {
                          await apiClient.delete(`/icons/${item.id}`);
                          await fetchIcons(currentPage, debouncedSearch);
                        } catch (e) {
                          console.error("Failed to delete icon", e);
                        }
                      }
                    }}
                  >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Icons ({totalCount})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {icons.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg table-row-hover">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center overflow-hidden">
                      {item.icon ? (
                        <img
                          src={item.icon}
                          alt="icon"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {item.tags.length > 0 ? (
                        item.tags.map((tag, idx) => (
                          <Badge key={`${item.id}-tag-l-${idx}`} variant="secondary" className="text-xs">{tag}</Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-xs">No tags</Badge>
                      )}
                    </div>
                    </div>
                    <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                      <Edit className="h-4 w-4" />
                      </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={async () => {
                        if (confirm("Delete this icon?")) {
                          try {
                            await apiClient.delete(`/icons/${item.id}`);
                            await fetchIcons(currentPage, debouncedSearch);
                          } catch (e) {
                            console.error("Failed to delete icon", e);
                          }
                        }
                      }}
                    >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                disabled={currentPage <= 1 || isLoading}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">Page {currentPage} of {lastPage}</div>
              <Button
                variant="outline"
                onClick={() => {
                  if (currentPage < lastPage) setCurrentPage(currentPage + 1);
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

export default MediaLibrary;