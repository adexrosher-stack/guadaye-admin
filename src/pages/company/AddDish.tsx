"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  ArrowLeft,
  Search,
  Plus,
  Minus,
  ChevronRight,
} from "lucide-react";

// Fake data (unchanged)
const ALL_DISHES = [
  "Spaghetti Bolognese",
  "Injera with Shiro",
  "Burger Special",
  "Tibs",
  "Pizza Margherita",
];

const NON_PROCESSED_INGREDIENTS = [
  { name: "1 Lit Bottle Water", unit: "piece", icon: "🥤" },
  { name: "1/2 Lit Bottle Water", unit: "piece", icon: "🥤" },
  { name: "2 Lit Bottle Water", unit: "piece", icon: "🥤" },
  { name: "Acacia Wine (አካሲያ ወይን)", unit: "bottle", icon: "🍷" },
  { name: "Acheto (አቼቶ)", unit: "piece", icon: "🌿" },
  { name: "Aframomum Coriariima Powdered (ፒፒር ቅመም ዱቄት)", unit: "g", icon: "🌶️" },
  { name: "Almonds (አልሞንድ)", unit: "g", icon: "🥜" },
];

const PROCESSED_INGREDIENTS = [
  { name: "250 gm pasta (250 ግራም ፓስታ)", unit: "pack", icon: "🍝" },
  { name: "Aluminium shan (አሉሚኒየም ሻን)", unit: "piece", icon: "🥫" },
  { name: "Beef Patty (ቢፍ ፓቲ)", unit: "piece", icon: "🥩" },
  { name: "Boiled Chicken Egg (የተቀቀለ ዶሮ እንቁላል)", unit: "piece", icon: "🥚" },
  { name: "Boiled Egg (የተቀቀለ እንቁላል)", unit: "piece", icon: "🥚" },
  { name: "Cabbage (ጎመን)", unit: "kg", icon: "🥬" },
];

const ICON_GALLERY = [
  "🍝",
  "🍕",
  "🍔",
  "🌮",
  "🥗",
  "🍜",
  "🍣",
  "🍤",
  "🥩",
  "🍳",
  "🥟",
  "🥐",
  "🍰",
  "🧁",
  "🍪",
  "🍫",
  "🥤",
  "☕",
  "🧋",
  "🍷",
];

type Step = 1 | 2 | 3;

interface Ingredient {
  name: string;
  unit: string;
  icon: string;
  quantity: number;
}

export default function CreateNewDishPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [searchDish, setSearchDish] = useState("");
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"non-processed" | "processed">("non-processed");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // ─── New state for step 3 fields ───
  const [dishNames, setDishNames] = useState({
    english: "",
    amharic: "",
    oromo: "",
    somali: "",
    afar: "",
  });

  const [price, setPrice] = useState<number | "">("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [prefix, setPrefix] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>(ICON_GALLERY[0]);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [customIconUrl, setCustomIconUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  const filteredDishes = ALL_DISHES.filter((d) =>
    d.toLowerCase().includes(searchDish.toLowerCase())
  );

  const showAddNewDishSection = searchDish.trim() !== "" && filteredDishes.length === 0;

  const filteredIngredients = activeTab === "non-processed"
    ? NON_PROCESSED_INGREDIENTS.filter((i) =>
        i.name.toLowerCase().includes(ingredientSearch.toLowerCase())
      )
    : PROCESSED_INGREDIENTS.filter((i) =>
        i.name.toLowerCase().includes(ingredientSearch.toLowerCase())
      );

  const selectDish = (dishName: string) => {
    setSelectedDish(dishName);
    setDishNames((prev) => ({ ...prev, english: dishName }));
    setSearchDish("");
    setStep(2);
  };

  const addIngredient = (ing: typeof NON_PROCESSED_INGREDIENTS[number]) => {
    if (ingredients.some((item) => item.name === ing.name)) return;
    setIngredients((prev) => [...prev, { ...ing, quantity: 1 }]);
  };

  const updateQuantity = (name: string, delta: number) => {
    setIngredients((prev) =>
      prev.map((item) =>
        item.name === name
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const goNext = () => {
    if (step < 3) setStep((s) => (s + 1) as Step);
  };

  const goBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const handleCreate = () => {
    if (!dishNames.english.trim()) {
      alert("English dish name is required!");
      return;
    }

    const finalDish = {
      prefix: prefix.trim() || null,
      icon: customIconUrl ?? selectedIcon,
      iconType: customIconUrl ? "custom" : "emoji",
      names: dishNames,
      price: price !== "" ? Number(price) : null,
      imageUrl: imageUrl.trim() || null,
      description: description.trim() || null,
      ingredients,
    };

    console.log("Dish to be created:", finalDish);
    alert("Dish created successfully!\nCheck console for the collected data.");
    onClose();
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
                onClick={goBack}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="text-xl font-semibold">Create New Dish</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-5 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium border-2 text-sm ${
                  step >= 1 ? "bg-orange-500 border-orange-500" : "bg-gray-300 border-gray-300"
                }`}
              >
                1
              </div>
              <div className={`h-1 flex-1 mx-2 ${step >= 2 ? "bg-orange-500" : "bg-gray-300"}`} />
            </div>
            <div className="flex-1 flex items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium border-2 text-sm ${
                  step >= 2 ? "bg-orange-500 border-orange-500" : "bg-gray-300 border-gray-300"
                }`}
              >
                2
              </div>
              <div className={`h-1 flex-1 mx-2 ${step >= 3 ? "bg-orange-500" : "bg-gray-300"}`} />
            </div>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-medium border-2 text-sm ${
                step >= 3 ? "bg-orange-500 border-orange-500" : "bg-gray-300 border-gray-300"
              }`}
            >
              3
            </div>
          </div>

          <div className="flex justify-between mt-3 text-xs text-gray-600 font-medium">
            <span className={step >= 1 ? "text-orange-600" : ""}>Select Dish</span>
            <span className={step >= 2 ? "text-orange-600" : ""}>Add Ingredients</span>
            <span className={step >= 3 ? "text-orange-600" : ""}>Finalize</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 pb-24">
          {step === 1 && (
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search or type dish name..."
                  value={searchDish}
                  onChange={(e) => setSearchDish(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
              </div>

              {showAddNewDishSection ? (
                <div className="text-center py-10">
                  <p className="text-gray-600 mb-6">
                    No matching dish found for "<strong>{searchDish}</strong>"
                  </p>
                  <button
                    onClick={() => selectDish(searchDish)}
                    className="bg-orange-500 text-white px-10 py-4 rounded-xl font-medium hover:bg-orange-600 transition-colors shadow-sm"
                  >
                    + Create “{searchDish}”
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDishes.map((dish) => (
                    <button
                      key={dish}
                      onClick={() => selectDish(dish)}
                      className="w-full p-4 text-left border rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors"
                    >
                      <p className="font-medium">{dish}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="pb-2">
                <p className="text-sm text-gray-600">Dish</p>
                <p className="font-semibold text-lg">{selectedDish}</p>
              </div>

              <h3 className="text-lg font-semibold pt-2">Add Ingredients</h3>

              {ingredients.length > 0 && (
                <div className="flex items-center gap-2 mt-3 mb-4 overflow-x-auto py-1">
                  {ingredients.map((item) => (
                    <span
                      key={item.name}
                      className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm text-orange-700"
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="truncate max-w-[10rem]">{item.name}</span>
                      <button
                        type="button"
                        onClick={() => setIngredients((prev) => prev.filter((i) => i.name !== item.name))}
                        className="p-1 rounded-full hover:bg-orange-200"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ingredient..."
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("non-processed")}
                  className={`flex-1 py-3 font-medium text-center ${
                    activeTab === "non-processed"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-gray-600 hover:text-gray-800"
                  } transition-colors`}
                >
                  Non-Processed
                </button>
                <button
                  onClick={() => setActiveTab("processed")}
                  className={`flex-1 py-3 font-medium text-center ${
                    activeTab === "processed"
                      ? "border-b-2 border-orange-500 text-orange-600"
                      : "text-gray-600 hover:text-gray-800"
                  } transition-colors`}
                >
                  Processed
                </button>
              </div>

              <div className="space-y-3 min-h-[200px]">
                {filteredIngredients.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    No ingredients found matching "{ingredientSearch}"
                  </div>
                ) : (
                  filteredIngredients.map((ing) => (
                    <div
                      key={ing.name}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{ing.icon}</span>
                        <p className="font-medium">{ing.name}</p>
                      </div>
                      <button
                        onClick={() => addIngredient(ing)}
                        className="px-5 py-2 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  ))
                )}
              </div>

              {ingredients.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-semibold mb-4">Selected ({ingredients.length})</h4>
                  <div className="space-y-5">
                    {ingredients.map((item) => (
                      <div key={item.name} className="border-b pb-5 last:border-b-0">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{item.icon}</span>
                          <p className="font-medium">{item.name}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => updateQuantity(item.name, -1)}
                            className="p-2 border rounded hover:bg-gray-100"
                          >
                            <Minus className="h-5 w-5" />
                          </button>
                          <div className="w-16 text-center border rounded py-2 bg-gray-50 font-medium">
                            {item.quantity}
                          </div>
                          <button
                            onClick={() => updateQuantity(item.name, 1)}
                            className="p-2 border rounded hover:bg-gray-100"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                          <span className="text-gray-600 font-medium ml-2">{item.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-center">Finalize Dish</h3>

              {/* Icon */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="block text-sm font-medium text-gray-700">Dish Icon</p>
                    <p className="text-xs text-gray-500">Choose an icon to represent the dish</p>
                  </div>
                  <div className="text-2xl">{selectedIcon}</div>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(true)}
                    className="w-full flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left shadow-sm hover:bg-gray-50 transition"
                  >
                    <span>
                      <span className="text-sm font-medium text-gray-700">Choose your own icon</span>
                      <span className="block text-xs text-gray-500">Open gallery to pick a custom icon</span>
                    </span>
                    <span className="text-2xl">{customIconUrl ? <img src={customIconUrl} className="h-7 w-7 rounded" alt="Selected icon" /> : selectedIcon}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-left shadow-sm hover:bg-gray-50 transition"
                  >
                    <span className="text-sm font-medium text-gray-700">Upload your own icon</span>
                    <span className="text-xs text-gray-500">PNG/JPG/SVG (max 3MB)</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = URL.createObjectURL(file);
                      setCustomIconUrl(url);
                      setShowIconPicker(false);
                    }}
                  />

                  {customIconUrl && (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={customIconUrl} className="h-10 w-10 rounded" alt="Custom icon preview" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Custom icon selected</p>
                          <p className="text-xs text-gray-500">You can remove or replace it anytime</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          URL.revokeObjectURL(customIconUrl);
                          setCustomIconUrl(null);
                        }}
                        className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                        aria-label="Remove custom icon"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}

                  {showIconPicker && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                      <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setShowIconPicker(false)}
                      />
                      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold">Select an icon</h3>
                            <p className="text-sm text-gray-500">
                              Pick an icon that best represents this dish.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowIconPicker(false)}
                            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
                            aria-label="Close icon gallery"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="mt-5 grid grid-cols-6 gap-3 max-h-72 overflow-y-auto pr-1">
                          {ICON_GALLERY.map((icon) => {
                            const isSelected = icon === selectedIcon && !customIconUrl;
                            return (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => {
                                  setSelectedIcon(icon);
                                  setCustomIconUrl(null);
                                  setShowIconPicker(false);
                                }}
                                className={`h-12 w-12 rounded-lg flex items-center justify-center text-2xl transition-colors border ${
                                  isSelected
                                    ? "border-orange-500 bg-orange-50"
                                    : "border-gray-200 bg-white hover:bg-gray-50"
                                }`}
                                aria-label={`Select icon ${icon}`}
                              >
                                {icon}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Prefix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prefix (optional)
                </label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  placeholder="e.g. Special, Family, King Size"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
              </div>

              {/* Dish Names – 5 languages */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Dish Name
                </label>

                <input
                  type="text"
                  value={dishNames.english}
                  onChange={(e) =>
                    setDishNames((prev) => ({ ...prev, english: e.target.value }))
                  }
                  placeholder="English (Required)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  required
                />

                <input
                  type="text"
                  value={dishNames.amharic}
                  onChange={(e) =>
                    setDishNames((prev) => ({ ...prev, amharic: e.target.value }))
                  }
                  placeholder="አማርኛ (Amharic - Optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />

                <input
                  type="text"
                  value={dishNames.oromo}
                  onChange={(e) =>
                    setDishNames((prev) => ({ ...prev, oromo: e.target.value }))
                  }
                  placeholder="Afaan Oromoo (Optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />

                <input
                  type="text"
                  value={dishNames.somali}
                  onChange={(e) =>
                    setDishNames((prev) => ({ ...prev, somali: e.target.value }))
                  }
                  placeholder="Soomaali (Somali - Optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />

                <input
                  type="text"
                  value={dishNames.afar}
                  onChange={(e) =>
                    setDishNames((prev) => ({ ...prev, afar: e.target.value }))
                  }
                  placeholder="Qafar (Afar - Optional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (ETB)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/dish.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of the dish..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 resize-y"
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                <p><strong>Base dish:</strong> {selectedDish || "—"}</p>
                <p><strong>Ingredients:</strong> {ingredients.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 3 && (
          <div className="absolute bottom-0 left-0 right-0 p-5 border-t bg-white">
            <button
              onClick={goNext}
              disabled={
                (step === 1 && !selectedDish) ||
                (step === 2 && ingredients.length === 0)
              }
              className={`
                w-full py-4 rounded-xl font-medium text-white flex items-center justify-center gap-2
                transition-colors
                ${step === 1 || step === 2
                  ? "bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"}
              `}
            >
              {step === 1 ? "Next" : "Review & Create"}
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="absolute bottom-0 left-0 right-0 p-5 border-t bg-white">
            <button
              onClick={handleCreate}
              disabled={!dishNames.english.trim()}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
            >
              Create Dish
            </button>
          </div>
        )}
      </div>
    </>
  );
}