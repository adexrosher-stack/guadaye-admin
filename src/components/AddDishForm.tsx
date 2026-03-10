import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type LocalizedForm = Record<LanguageCode, { name: string; description: string }>;

const AddDishForm = ({ onSubmit, isSubmitting = false, initialValues, submitLabel = "Save Dish" }: { onSubmit: (data: any) => void | Promise<void>; isSubmitting?: boolean; initialValues?: Partial<LocalizedForm>; submitLabel?: string }) => {
  const [formData, setFormData] = useState<LocalizedForm>({
    en: { name: "", description: "" },
    or: { name: "", description: "" },
    so: { name: "", description: "" },
    ti: { name: "", description: "" },
    am: { name: "", description: "" },
  });

  useEffect(() => {
    if (initialValues) {
      setFormData((prev) => ({
        en: initialValues.en ?? prev.en,
        or: initialValues.or ?? prev.or,
        so: initialValues.so ?? prev.so,
        ti: initialValues.ti ?? prev.ti,
        am: initialValues.am ?? prev.am,
      }));
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
    const name: Record<string, string> = {};
    const description: Record<string, string> = {};

    Object.keys(formData).forEach((lang) => {
      name[lang] = formData[lang as LanguageCode].name;
      description[lang] = formData[lang as LanguageCode].description;
    });

    const payload = { name, description, icon };
    onSubmit(payload);
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

      {/* Icon Upload with Drag & Drop */}
      <div>
        <label className="block mb-2 font-medium text-sm text-gray-700">
          Dish Icon
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

export default AddDishForm;
