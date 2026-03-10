"use client";

import { useState } from "react";
import {
  X,
  ArrowLeft,
  Search,
  Upload,
  ChevronRight,
  Globe,
  EyeOff,
} from "lucide-react";

// Hard-coded categories data (unchanged)
const ALL_CATEGORIES = [
  { id: 1, name: "Appetizers", amharic: "አፕቲዘርስ", icon: "🍤" },
  { id: 2, name: "Soups", amharic: "ሶፕስ", icon: "🍲" },
  { id: 3, name: "Pasta", amharic: "ፓስታ", icon: "🍝" },
  { id: 4, name: "Burgers", amharic: "በርገርስ", icon: "🍔" },
  { id: 5, name: "Pizzas", amharic: "ፒዛስ", icon: "🍕" },
  { id: 6, name: "Desserts", amharic: "ዴሰርትስ", icon: "🍰" },
  { id: 7, name: "Beverages", amharic: "ቤቨራጅስ", icon: "🥤" },
  { id: 8, name: "Salads", amharic: "ሳላድስ", icon: "🥗" },
  { id: 9, name: "Seafood", amharic: "ሲፉድ", icon: "🦞" },
  { id: 10, name: "Hot drinks", amharic: "ሆት ድሪንክስ", icon: "☕" },
  { id: 11, name: "Sandwich", amharic: "ሳንድዊች", icon: "🥪" },
  { id: 12, name: "Shake", amharic: "ሼክ", icon: "🧋" },
  { id: 13, name: "Smoothies", amharic: "ስሙዝስ", icon: "🍹" },
];

type Step = 1 | 2;

interface LanguageFields {
  english: string;
  amharic?: string;
  oromo?: string;
  somali?: string;
  tigrigna?: string;
}

interface CreateCategoryPanelProps {
  open: boolean;
  onClose: () => void;
  onSave?: (payload: {
    name: LanguageFields;
    description: LanguageFields;
    iconFile?: File;
    iconPreview?: string;
  }) => void;
}

export default function CreateCategoryPanel({
  open,
  onClose,
  onSave,
}: CreateCategoryPanelProps) {
  const [step, setStep] = useState<Step>(1);
  const [searchCategory, setSearchCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<typeof ALL_CATEGORIES[number] | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<LanguageFields>({ english: "" });
  const [description, setDescription] = useState<LanguageFields>({ english: "" });
  const [showAdditionalLanguages, setShowAdditionalLanguages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  if (!open) return null;

  const itemsPerPage = 9;
  const filteredCategories = ALL_CATEGORIES.filter((cat) =>
    cat.name.toLowerCase().includes(searchCategory.toLowerCase())
  );
  const showCreateButton = searchCategory.trim() !== "" && filteredCategories.length === 0;
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateName = (lang: keyof LanguageFields, value: string) => {
    setCategoryName((prev) => ({ ...prev, [lang]: value }));
  };

  const updateDescription = (lang: keyof LanguageFields, value: string) => {
    setDescription((prev) => ({ ...prev, [lang]: value }));
  };

  const handleCreateOrAdd = () => {
    if (step === 1) {
      if (selectedCategory) {
        // Adding existing category
        console.log("Adding existing category:", selectedCategory);
        alert(`Category "${selectedCategory.name}" added!`);
        onClose();
      } else if (showCreateButton) {
        // Moving to create new
        setStep(2);
      }
    } else if (step === 2) {
      // Creating new category
      if (!categoryName.english.trim()) {
        alert("English category name is required");
        return;
      }

      const payload = {
        name: categoryName,
        description,
        iconFile: iconFile || undefined,
        iconPreview: iconPreview || undefined,
      };

      if (onSave) {
        onSave(payload);
      } else {
        console.log("New category created:", payload);
        alert("New category created: " + categoryName.english);
      }

      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-md lg:max-w-lg xl:max-w-xl
          flex flex-col
          bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(1)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="text-xl font-semibold">
              {step === 1 ? "Add Category" : "Create Category"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-24">
          {step === 1 && (
            <div className="space-y-6">
              <p className="text-gray-600 text-sm">
                Select the category you want to add on your branch.
              </p>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Category Name"
                  value={searchCategory}
                  onChange={(e) => {
                    setSearchCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
              </div>

              {filteredCategories.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-600 mb-4">No Categories Found</p>
                  {showCreateButton && (
                    <button
                      onClick={() => setStep(2)}
                      className="bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                    >
                      Create Category
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    {paginatedCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                          selectedCategory?.id === cat.id
                            ? "bg-orange-100 border border-orange-400"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="w-16 h-16 flex items-center justify-center text-4xl bg-white rounded-full mb-2 shadow-sm">
                          {cat.icon}
                        </div>
                        <p className="text-center font-medium text-sm">{cat.name}</p>
                        <p className="text-center text-xs text-gray-500">({cat.amharic})</p>
                      </button>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        <ChevronRight className="h-5 w-5 rotate-180" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-full text-sm font-medium ${
                            page === currentPage
                              ? "bg-orange-500 text-white"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              {/* Icon Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select an icon
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    {iconPreview ? (
                      <img
                        src={iconPreview}
                        alt="Icon preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <label className="cursor-pointer bg-orange-50 text-orange-600 px-5 py-2.5 rounded-lg hover:bg-orange-100 transition-colors font-medium">
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIconChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {!iconPreview && (
                  <p className="text-center mt-3 text-sm text-gray-500">No icon selected</p>
                )}
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="English (Required)"
                  value={categoryName.english}
                  onChange={(e) => updateName("english", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />

                <button
                  onClick={() => setShowAdditionalLanguages(!showAdditionalLanguages)}
                  className="flex items-center gap-2 text-orange-600 text-sm mt-3 hover:underline"
                >
                  {showAdditionalLanguages ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                  {showAdditionalLanguages ? "Hide" : "Show"} additional languages
                </button>

                {showAdditionalLanguages && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Amharic (Optional)"
                      value={categoryName.amharic || ""}
                      onChange={(e) => updateName("amharic", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    />
                    <input
                      type="text"
                      placeholder="Afan Oromo (Optional)"
                      value={categoryName.oromo || ""}
                      onChange={(e) => updateName("oromo", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    />
                    <input
                      type="text"
                      placeholder="Somali (Optional)"
                      value={categoryName.somali || ""}
                      onChange={(e) => updateName("somali", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    />
                    <input
                      type="text"
                      placeholder="Tigrigna (Optional)"
                      value={categoryName.tigrigna || ""}
                      onChange={(e) => updateName("tigrigna", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="English (Required)"
                  value={description.english}
                  onChange={(e) => updateDescription("english", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 mb-2"
                />

                <button
                  onClick={() => setShowAdditionalLanguages(!showAdditionalLanguages)}
                  className="flex items-center gap-2 text-orange-600 text-sm hover:underline"
                >
                  {showAdditionalLanguages ? <EyeOff className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                  {showAdditionalLanguages ? "Hide" : "Show"} additional languages
                </button>

                {showAdditionalLanguages && (
                  <div className="mt-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Amharic (Optional)"
                      value={description.amharic || ""}
                      onChange={(e) => updateDescription("amharic", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    />
                    <input
                      type="text"
                      placeholder="Afan Oromo (Optional)"
                      value={description.oromo || ""}
                      onChange={(e) => updateDescription("oromo", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    />
                    <input
                      type="text"
                      placeholder="Somali (Optional)"
                      value={description.somali || ""}
                      onChange={(e) => updateDescription("somali", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    />
                    <input
                      type="text"
                      placeholder="Tigrigna (Optional)"
                      value={description.tigrigna || ""}
                      onChange={(e) => updateDescription("tigrigna", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t bg-white">
          <button
            onClick={handleCreateOrAdd}
            disabled={
              (step === 1 && !selectedCategory && !showCreateButton) ||
              (step === 2 && !categoryName.english.trim())
            }
            className={`
              w-full py-4 rounded-xl font-medium text-white flex items-center justify-center gap-2
              transition-colors
              ${step === 1
                ? "bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"}
            `}
          >
            {step === 1
              ? selectedCategory
                ? "Add Selected"
                : "Create New Category"
              : "Create Category"}
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
}