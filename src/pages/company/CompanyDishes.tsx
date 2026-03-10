"use client";

import { useState } from "react";
import { Search, Edit2, Trash } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AddDish from "./AddDish";  // ← assuming this is your AddDish.tsx file

type Dish = {
  id: string;
  name: string;
  amName: string;
  price: number;
  image: string;
  description: string;
};

/* demo data */
const initialDishes: Dish[] = [
  {
    id: "1",
    name: "Boss Special Burger",
    amName: "ቦስ ስፔሻል በርገር",
    price: 750,
    image: "/burger1.jpg",
    description: "Boss Special Burger",
  },
  {
    id: "2",
    name: "Beef Burger",
    amName: "ቢፍ በርገር",
    price: 540,
    image: "/burger.jpg",
    description: "Beef Burger",
  },
  {
    id: "3",
    name: "Cheese Burger",
    amName: "ቺዝ በርገር",
    price: 470,
    image: "/burger3.jpg",
    description: "Cheese Burger",
  },
];

/* demo categories */
const categories = [
  { id: "1", name: "Burgers" },
  { id: "2", name: "Hot drinks" },
];

export default function CompanyDishes() {
  const navigate = useNavigate();
  const { companyId, branchId, categoryId } = useParams();

  const categoryName =
    categories.find((c) => c.id === categoryId)?.name || "Category";

  const [dishes, setDishes] = useState<Dish[]>(initialDishes);
  const [search, setSearch] = useState("");
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveDish = (savedDish: Dish) => {
    if (editingDish) {
      // update existing
      setDishes((prev) =>
        prev.map((d) => (d.id === savedDish.id ? savedDish : d))
      );
    } else {
      // add new
      setDishes((prev) => [
        ...prev,
        { ...savedDish, id: Date.now().toString() },
      ]);
    }
    setAddDrawerOpen(false);
    setEditDrawerOpen(false);
    setEditingDish(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this dish?")) return;
    setDishes((prev) => prev.filter((d) => d.id !== id));
  };

  const handleViewDetails = (dishId: string) => {
    navigate(
      `/company/${companyId}/branches/${branchId}/menu-management/${categoryId}/dishes/${dishId}`
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{categoryName}</h1>

          {/* BREADCRUMB */}
          <p className="text-sm text-gray-400 mt-1 flex flex-wrap items-center gap-1">
            <Link to="/company" className="hover:text-gray-600">
              Dashboard
            </Link>
            <span>&gt;</span>

            <Link
              to={`/company/${companyId}/branches`}
              className="hover:text-gray-600"
            >
              Branch
            </Link>
            <span>&gt;</span>

            <Link
              to={`/company/${companyId}/branches/${branchId}/menu-management`}
              className="hover:text-gray-600"
            >
              Menu Management
            </Link>
            <span>&gt;</span>

            <span className="text-orange-600 font-medium">
              {categoryName}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setAddDrawerOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Add new dish
          </button>
        </div>
      </div>

      {/* CATEGORY ROW */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{categoryName}</h2>
          <p className="text-sm text-gray-400">
            Lists all available dishes
          </p>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dishes"
          className="border rounded-lg px-4 py-2 text-sm"
        />
      </div>

      {/* DISH GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredDishes.map((dish) => (
          <div
            key={dish.id}
            className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
          >
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-40 object-cover"
            />

            <div className="p-4 pb-14 space-y-1">
              <p className="font-semibold text-lg">{dish.name}</p>
              <p className="text-sm text-gray-500">{dish.amName}</p>

              <div className="mt-2 inline-block bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
                {dish.price} ETB
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="absolute bottom-2 left-0 right-0 px-4 flex gap-2">
              <button
                onClick={() => {
                  setEditingDish(dish);
                  setEditDrawerOpen(true);
                }}
                className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-600 py-2 rounded-lg flex items-center justify-center"
              >
                <Edit2 size={16} />
              </button>

              <button
                onClick={() => handleDelete(dish.id)}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 py-2 rounded-lg flex items-center justify-center"
              >
                <Trash size={16} />
              </button>

              <button
                onClick={() => handleViewDetails(dish.id)}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-500 py-2 rounded-lg flex items-center justify-center"
              >
                <Search size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Dish Drawer */}
      {addDrawerOpen && (
        <AddDish
          open={addDrawerOpen}
          onClose={() => setAddDrawerOpen(false)}
          onSave={(newDish) => {
            handleSaveDish(newDish);
          }}
        />
      )}

      {/* Edit Dish Drawer */}
      {editDrawerOpen && editingDish && (
        <DishDrawer
          dish={editingDish}
          onClose={() => {
            setEditDrawerOpen(false);
            setEditingDish(null);
          }}
          onSave={handleSaveDish}
        />
      )}
    </div>
  );
}

/* ───────────── Dish Drawer (for Edit) ───────────── */

const DishDrawer = ({
  dish,
  onClose,
  onSave,
}: {
  dish: Dish;
  onClose: () => void;
  onSave: (dish: Dish) => void;
}) => {
  const [name, setName] = useState(dish.name || "");
  const [amName, setAmName] = useState(dish.amName || "");
  const [price, setPrice] = useState(dish.price || 0);
  const [image, setImage] = useState(dish.image || "/placeholder.jpg");
  const [description, setDescription] = useState(dish.description || "");

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <div className="w-full max-w-md bg-white h-full p-6 space-y-4 shadow-xl">
        <h2 className="text-xl font-semibold">Edit Dish</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dish name"
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          value={amName}
          onChange={(e) => setAmName(e.target.value)}
          placeholder="Dish name (Amharic)"
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          placeholder="Price"
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Image path"
          className="w-full border rounded-lg px-3 py-2"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full border rounded-lg px-3 py-2"
        />

        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 border rounded-lg py-2">
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({
                ...dish,
                name,
                amName,
                price,
                image,
                description,
              })
            }
            className="flex-1 bg-orange-500 text-white rounded-lg py-2"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};