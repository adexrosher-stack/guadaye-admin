import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Plus, X, Upload } from "lucide-react";
import apiClient from "@/lib/api";

interface DishImage {
  id: number;
  image_path: string;
}

interface DishImageManagerProps {
  dishId: number | string;
  existingImages?: DishImage[];
  onImagesUpdated?: (images: DishImage[]) => void;
}

const DishImageManager = ({ dishId, existingImages = [], onImagesUpdated }: DishImageManagerProps) => {
  const [images, setImages] = useState<DishImage[]>(existingImages);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelection = (files: FileList) => {
    if (!files.length) return;
    const newFiles = Array.from(files);
    setPendingFiles(prev => [...prev, ...newFiles]);
  };

  const uploadPendingFiles = async () => {
    if (!pendingFiles.length) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      pendingFiles.forEach((file) => {
        formData.append("images[]", file);
      });

      const response = await apiClient.post(`/dishes/${dishId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newImages = response.data;
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      setPendingFiles([]);
      onImagesUpdated?.(updatedImages);
    } catch (error) {
      console.error("Failed to upload images:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files);
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const deleteImage = async (imageId: number) => {
    setIsDeleting(imageId);
    try {
      await apiClient.delete(`/dishes/${dishId}/images/${imageId}`);
      const updatedImages = images.filter((img) => img.id !== imageId);
      setImages(updatedImages);
      onImagesUpdated?.(updatedImages);
    } catch (error) {
      console.error("Failed to delete image:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dish Images</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {images.length} image{images.length !== 1 ? "s" : ""}
            {pendingFiles.length > 0 && (
              <span className="ml-2 text-blue-600">
                + {pendingFiles.length} pending
              </span>
            )}
          </span>
          {pendingFiles.length > 0 && (
            <Button 
              onClick={uploadPendingFiles} 
              disabled={isUploading}
              size="sm"
            >
              {isUploading ? "Uploading..." : `Upload ${pendingFiles.length} Image${pendingFiles.length !== 1 ? "s" : ""}`}
            </Button>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        )}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1">
          Drop images here or click to browse
        </p>
        <p className="text-xs text-gray-400">
          Supports JPG, PNG, SVG, WebP (max 1MB each)
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          ref={inputRef}
        />
      </div>

      {/* Pending Files Preview */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-blue-600">Pending Uploads:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pendingFiles.map((file, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-2">
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${file.name}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 p-0"
                      onClick={() => removePendingFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="relative group">
              <CardContent className="p-2">
                <div className="relative">
                  <img
                      src={image.image_path}
                    alt={`Dish image ${image.id}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteImage(image.id)}
                    disabled={isDeleting === image.id}
                  >
                    {isDeleting === image.id ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DishImageManager;
