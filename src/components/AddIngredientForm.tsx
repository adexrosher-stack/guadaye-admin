import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type LanguageCode = "en" | "am" | "or" | "ti" | "so";

const languages: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "am", label: "Amharic" },
  { code: "or", label: "Oromo" },
  { code: "ti", label: "Tigrinya" },
  { code: "so", label: "Somali" },
];

const measurementUnits = [
  "kg", "g", "lb", "oz", "l", "ml", "cup", "tbsp", "tsp", "piece", "slice", "clove", "bunch", "head", "can", "pack"
];

type LocalizedForm = Record<LanguageCode, { name: string; description: string }>;

const AddIngredientForm = ({ onSubmit, isSubmitting = false, initialValues, submitLabel = "Save Ingredient" }: { onSubmit: (data: any) => void | Promise<void>; isSubmitting?: boolean; initialValues?: Partial<LocalizedForm & { measurement_unit?: string; is_produced?: boolean; iconUrl?: string }>; submitLabel?: string }) => {
  const [formData, setFormData] = useState<LocalizedForm>({
    en: { name: "", description: "" },
    or: { name: "", description: "" },
    so: { name: "", description: "" },
    ti: { name: "", description: "" },
    am: { name: "", description: "" },
  });

  const [measurementUnit, setMeasurementUnit] = useState(initialValues?.measurement_unit || "");
  const [isProduced, setIsProduced] = useState<boolean>(initialValues?.is_produced ?? false);

  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({
        en: initialValues.en ?? prev.en,
        or: initialValues.or ?? prev.or,
        so: initialValues.so ?? prev.so,
        ti: initialValues.ti ?? prev.ti,
        am: initialValues.am ?? prev.am,
      }));
      setMeasurementUnit(initialValues.measurement_unit || "");
      setIsProduced(initialValues.is_produced ?? false);
    }
  }, [initialValues]);

  const [icon, setIcon] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (
    lang: LanguageCode,
    field: "name" | "description",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value,
      },
    }));
  };

  const handleIconChange = (file: File) => {
    setIcon(file);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleIconChange(file);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const names: Partial<Record<LanguageCode, string>> = {};
    const descriptions: Partial<Record<LanguageCode, string>> = {};

    (Object.keys(formData) as LanguageCode[]).forEach((lang) => {
      const trimmedName = formData[lang].name.trim();
      const trimmedDescription = formData[lang].description.trim();

      if (trimmedName) {
        names[lang] = trimmedName;
      }

      if (trimmedDescription) {
        descriptions[lang] = trimmedDescription;
      }
    });

    onSubmit({
      name: names,
      description: descriptions,
      measurement_unit: measurementUnit,
      is_produced: isProduced,
      icon,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <Tabs defaultValue="en" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          {languages.map((lang) => (
            <TabsTrigger key={lang.code} value={lang.code}>
              {lang.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {languages.map((lang) => (
          <TabsContent key={lang.code} value={lang.code}>
            <div className="space-y-4">
              <Input
                placeholder={`Name in ${lang.label}`}
                value={formData[lang.code].name}
                onChange={(e) =>
                  handleChange(lang.code, "name", e.target.value)
                }
              />
              <Textarea
                placeholder={`Description in ${lang.label}`}
                value={formData[lang.code].description}
                onChange={(e) =>
                  handleChange(lang.code, "description", e.target.value)
                }
                rows={3}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Measurement Unit */}
      <div>
        <label className="block mb-2 font-medium text-sm text-gray-700">
          Measurement Unit
        </label>
        <Select value={measurementUnit} onValueChange={setMeasurementUnit}>
          <SelectTrigger>
            <SelectValue placeholder="Select measurement unit" />
          </SelectTrigger>
          <SelectContent>
            {measurementUnits.map((unit) => (
              <SelectItem key={unit} value={unit}>
                {unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Is Produced */}
      <div className="flex items-center gap-2">
        <input
          id="is_produced"
          type="checkbox"
          checked={isProduced}
          onChange={(e) => setIsProduced(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="is_produced" className="text-sm text-gray-700 select-none">
          Is produced
        </label>
      </div>

      {/* Icon Upload with Drag & Drop */}
      <div>
        <label className="block mb-2 font-medium text-sm text-gray-700">
          Ingredient Icon
        </label>

        <div
          className={cn(
            "border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          )}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          {icon ? (
            <img
              src={URL.createObjectURL(icon)}
              alt="Preview"
              className="h-32 w-32 object-cover rounded"
            />
          ) : (
            <>
              <p className="text-sm text-gray-500">
                Drag & drop an icon here, or click to browse
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Only image files are supported
              </p>
            </>
          )}
        </div>

        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) handleIconChange(e.target.files[0]);
          }}
          className="hidden"
          ref={inputRef}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
};

export default AddIngredientForm;
