// SubscriptionPackageManagement.tsx
import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Crown, Zap, Star, Coffee } from 'lucide-react';

type Package = {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  maxRestaurants: number;
  description: string;
};

// ────────────────────────────────────────────────
// Hardcoded initial packages
// ────────────────────────────────────────────────
const initialPackages: Package[] = [
  {
    id: 'pkg1',
    name: 'Free Trial',
    price: 0,
    durationMonths: 1,
    maxRestaurants: 1,
    description: 'Basic access for new users to test the platform. Limited features.',
  },
  {
    id: 'pkg2',
    name: 'Standard',
    price: 15000,
    durationMonths: 3,
    maxRestaurants: 3,
    description: 'Ideal for small restaurants or starting chains. Full basic features.',
  },
  {
    id: 'pkg3',
    name: 'Premium',
    price: 40000,
    durationMonths: 6,
    maxRestaurants: 10,
    description: 'Advanced features, priority support, analytics, and multi-branch management.',
  },
  {
    id: 'pkg4',
    name: 'Enterprise',
    price: 90000,
    durationMonths: 12,
    maxRestaurants: 30,
    description: 'For large-scale operations. Unlimited support, custom integrations, and API access.',
  },
];

const tierIcons = [<Coffee size={20} />, <Zap size={20} />, <Star size={20} />, <Crown size={20} />];

export default function SubscriptionPackageManagement() {
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  const [form, setForm] = useState({
    name: '',
    price: '',
    durationMonths: '',
    maxRestaurants: '',
    description: '',
  });

  const openForm = (pkg?: Package) => {
    if (pkg) {
      setEditingPackage(pkg);
      setForm({
        name: pkg.name,
        price: pkg.price.toString(),
        durationMonths: pkg.durationMonths.toString(),
        maxRestaurants: pkg.maxRestaurants.toString(),
        description: pkg.description,
      });
    } else {
      setEditingPackage(null);
      setForm({ name: '', price: '', durationMonths: '', maxRestaurants: '', description: '' });
    }
    setIsFormOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.durationMonths || !form.maxRestaurants) {
      alert('Please fill all required fields.');
      return;
    }

    const packageData: Package = {
      id: editingPackage?.id || Date.now().toString(),
      name: form.name.trim(),
      price: Number(form.price),
      durationMonths: Number(form.durationMonths),
      maxRestaurants: Number(form.maxRestaurants),
      description: form.description.trim(),
    };

    if (editingPackage) {
      setPackages((prev) => prev.map((p) => (p.id === editingPackage.id ? packageData : p)));
    } else {
      setPackages((prev) => [...prev, packageData]);
    }

    setIsFormOpen(false);
    setEditingPackage(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50/70 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Subscription Plans</h1>
            <p className="mt-1.5 text-gray-600">
              Manage pricing tiers, features, and access limits for restaurants.
            </p>
          </div>

          <button
            onClick={() => openForm()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-medium text-white shadow-md hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all"
          >
            <Plus size={20} />
            New Package
          </button>
        </div>

        {/* Packages Grid / List */}
        {packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white px-6 py-20 text-center">
            <h3 className="text-xl font-semibold text-gray-800">No subscription plans yet</h3>
            <p className="mt-2 text-gray-500">Get started by creating your first package.</p>
            <button
              onClick={() => openForm()}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-white hover:bg-orange-600"
            >
              <Plus size={18} /> Create Package
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="h-2 bg-gradient-to-r from-gray-300 via-orange-400 to-orange-500" />

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-orange-100 p-2 text-orange-600">
                        {tierIcons[index % tierIcons.length]}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
                    </div>
                  </div>

                  <div className="mb-5 space-y-3 text-sm text-gray-700">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-gray-900">
                        {pkg.price === 0 ? 'Free' : `${pkg.price.toLocaleString()}`}
                      </span>
                      {pkg.price > 0 && (
                        <span className="text-base font-medium text-gray-500">ETB</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="rounded bg-gray-100 px-2.5 py-1">
                        <span className="font-medium">{pkg.durationMonths}</span> mo
                      </div>
                      <div className="rounded bg-gray-100 px-2.5 py-1">
                        Max <span className="font-medium">{pkg.maxRestaurants}</span> restaurants
                      </div>
                    </div>
                  </div>

                  <p className="mt-auto text-sm leading-relaxed text-gray-600 line-clamp-3">
                    {pkg.description}
                  </p>
                </div>

                <div className="flex border-t bg-gray-50 px-6 py-4">
                  <button
                    onClick={() => openForm(pkg)}
                    className="mr-auto flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── Form Drawer ──────────────────────────────────────────────── */}
        {isFormOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setIsFormOpen(false)}
            />
            <div
              className={`fixed inset-y-0 right-0 z-50 w-full max-w-lg transform bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
                isFormOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b px-6 py-5">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingPackage ? 'Edit Package' : 'Create Package'}
                  </h2>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Package Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-gray-300 px-4 py-3 shadow-sm focus:border-orange-400 focus:ring-orange-400 sm:text-sm"
                      placeholder="e.g. Enterprise Plan"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Price (ETB) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleInputChange}
                        min="0"
                        className="block w-full rounded-lg border-gray-300 px-4 py-3 shadow-sm focus:border-orange-400 focus:ring-orange-400 sm:text-sm"
                        placeholder="15000"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Duration (months) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="durationMonths"
                        value={form.durationMonths}
                        onChange={handleInputChange}
                        min="1"
                        className="block w-full rounded-lg border-gray-300 px-4 py-3 shadow-sm focus:border-orange-400 focus:ring-orange-400 sm:text-sm"
                        placeholder="6"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Max Restaurants <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="maxRestaurants"
                      value={form.maxRestaurants}
                      onChange={handleInputChange}
                      min="1"
                      className="block w-full rounded-lg border-gray-300 px-4 py-3 shadow-sm focus:border-orange-400 focus:ring-orange-400 sm:text-sm"
                      placeholder="10"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      rows={5}
                      className="block w-full rounded-lg border-gray-300 px-4 py-3 shadow-sm focus:border-orange-400 focus:ring-orange-400 sm:text-sm"
                      placeholder="List key features, benefits, limitations..."
                    />
                  </div>

                  <div className="sticky bottom-0 -mx-6 -mb-6 border-t bg-white px-6 py-5">
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="flex-1 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 py-3 font-medium text-white hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all"
                      >
                        {editingPackage ? 'Update Package' : 'Create Package'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsFormOpen(false)}
                        className="flex-1 rounded-lg border border-gray-300 bg-white py-3 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}