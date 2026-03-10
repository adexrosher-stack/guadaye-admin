import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DishImageManager from "./DishImageManager";

interface DishImage {
  id: number;
  image_path: string;
}

interface DishImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dishId: number | string;
  dishName: string;
  initialImages?: DishImage[];
}

const DishImageDialog = ({ isOpen, onClose, dishId, dishName, initialImages = [] }: DishImageDialogProps) => {
  const [images, setImages] = useState<DishImage[]>(initialImages);

  useEffect(() => {
    if (isOpen) {
      setImages(initialImages);
    }
  }, [isOpen, initialImages]);

  const handleImagesUpdated = (updatedImages: DishImage[]) => {
    setImages(updatedImages);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Images for "{dishName}"</DialogTitle>
          <DialogDescription>
            Upload and manage multiple images for this dish.
          </DialogDescription>
        </DialogHeader>
        
        <DishImageManager
          dishId={dishId}
          existingImages={images}
          onImagesUpdated={handleImagesUpdated}
        />

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DishImageDialog;
