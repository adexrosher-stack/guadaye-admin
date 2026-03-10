"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import CreateCategory from "./CreateCategory"; // ← imported from separate file

// Hardcoded initial categories
const initialCategories = [
  { id: "1", icon: "🍔", name: "Burgers", amharic: "ንግርግር" },
  { id: "2", icon: "☕", name: "Hot drinks", amharic: "ተርም መጠጦች" },
  { id: "3", icon: "🥗", name: "Salads", amharic: "ሰላጣ" },
  { id: "4", icon: "🥪", name: "Sandwich", amharic: "ሳንድዊች" },
  { id: "5", icon: "🥤", name: "Shake", amharic: "ሼክ" },
  { id: "6", icon: "🍹", name: "Smoothies", amharic: "ስሙዝ" },
];

export default function MenuManagement() {
  const navigate = useNavigate();
  const { companyId, branchId } = useParams();

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<null | (typeof initialCategories[number])>(null);
  const [allCategories, setAllCategories] = useState(initialCategories);

  // Filter categories based on search term
  const filtered = allCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.amharic.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewDishes = (categoryId: string) => {
    navigate(`/company/${companyId}/branches/${branchId}/menu-management/${categoryId}/dishes`);
  };

  const handleEdit = (cat: typeof initialCategories[number]) => {
    setEditCategory(cat);
    setCreateOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Delete this category? This action cannot be undone.")) return;

    setAllCategories((prev) => prev.filter((c) => c.id !== id));
    alert("Category deleted successfully.");
  };

  const handleSaveCategory = (newOrUpdatedCategory: {
    id?: string;
    name: string;
    amharic: string;
    icon: string;
  }) => {
    if (newOrUpdatedCategory.id) {
      // Update existing
      setAllCategories((prev) =>
        prev.map((c) =>
          c.id === newOrUpdatedCategory.id ? { ...c, ...newOrUpdatedCategory } : c
        )
      );
      alert("Category updated successfully!");
    } else {
      // Create new
      const newCat = {
        id: Date.now().toString(),
        ...newOrUpdatedCategory,
      };
      setAllCategories((prev) => [...prev, newCat]);
      alert("Category created successfully!");
    }

    setCreateOpen(false);
    setEditCategory(null);
  };

  const branches = [
    { id: "3", name: "SJDH" },
  ];

  const branch = branches.find((b) => b.id === branchId);
  const branchName = branch ? branch.name : "Branch";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-6 max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
              <div className="mt-1 text-sm text-gray-500">
                <Link to="/company" className="text-blue-500 hover:text-blue-700">
                  Dashboard
                </Link>{" "}
                &gt;{" "}
                <Link
                  to={`/company/${companyId}/branches`}
                  className="text-blue-500 hover:text-blue-700"
                >
                  Branch
                </Link>{" "}
                &gt;{" "}
                
                &gt;{" "}
                <span className="text-orange-600 font-medium">Menu Management</span>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <select className="border border-gray-300 rounded-md px-4 py-2 text-sm bg-white min-w-[160px]">
                <option>{branchName}</option>
              </select>
              <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium">
                Generate menu pdf
              </button>
              <button className="bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium">
                Import category
              </button>

              <button
                onClick={() => {
                  setEditCategory(null);
                  setCreateOpen(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-md font-medium shadow-sm"
              >
                Create Category
              </button>

              <button className="text-gray-500 hover:text-gray-700">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-5 border-b flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
              <p className="text-sm text-gray-500 mt-0.5">Lists menu categories</p>
            </div>

            <button
              onClick={() => {
                setEditCategory(null);
                setCreateOpen(true);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-md font-medium"
            >
              Create Category
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                No categories found.
              </div>
            ) : (
              filtered.map((cat) => (
                <div
                  key={cat.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors"
                >
                  <div
                    onClick={() => handleViewDishes(cat.id)}
                    className="flex items-center gap-4 cursor-pointer flex-1"
                  >
                    <div className="w-10 h-10 flex items-center justify-center text-2xl">
                      {cat.icon}
                    </div>
                    <div className="font-medium">
                      {cat.name} <span className="text-gray-600">({cat.amharic})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 text-gray-500">
                    <button
                      onClick={() => handleViewDishes(cat.id)}
                      className="hover:text-orange-600 transition-colors"
                      title="View Dishes"
                    >
                      ♻
                    </button>
                    <button
                      onClick={() => handleEdit(cat)}
                      className="hover:text-orange-600 transition-colors"
                      title="Edit Category"
                    >
                      ✏
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="hover:text-red-600 transition-colors"
                      title="Delete Category"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Drawer – now imported from CreateCategory.tsx */}
      <CreateCategory
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setEditCategory(null);
        }}
        initialData={editCategory}
        onSave={handleSaveCategory}
      />
    </div>
  );
}