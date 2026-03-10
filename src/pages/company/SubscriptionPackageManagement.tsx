// SubscriptionPackageManagement.tsx
import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  X,
  Building,
  CalendarClock,
  Zap,
  Star,
  Coffee,
} from 'lucide-react';

type Package = {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  maxRestaurants: number;
  description: string;
};

type ActiveCompany = {
  id: string;
  name: string;
  packageId: string;
  expiresAt: string; // YYYY-MM-DD
  activatedAt: string; // YYYY-MM-DD
};

/* ────────────────────────────────────────────────
   MOCK DATA (only for development / demo)
───────────────────────────────────────────────── */
const initialPackages: Package[] = [
  {
    id: 'pkg1',
    name: 'Free Trial',
    price: 0,
    durationMonths: 1,
    maxRestaurants: 1,
    description: 'Basic access for testing.',
  },
  {
    id: 'pkg2',
    name: 'Standard',
    price: 15000,
    durationMonths: 3,
    maxRestaurants: 3,
    description: 'Great for small businesses.',
  },
  {
    id: 'pkg3',
    name: 'Premium',
    price: 40000,
    durationMonths: 6,
    maxRestaurants: 10,
    description: 'Analytics, priority support.',
  },
  {
    id: 'pkg4',
    name: 'Enterprise',
    price: 90000,
    durationMonths: 12,
    maxRestaurants: 30,
    description: 'Full features + integrations.',
  },
];

const initialActiveCompanies: ActiveCompany[] = [
  {
    id: 'comp1',
    name: 'Boss Burger',
    packageId: 'pkg3',
    expiresAt: '2026-07-10',
    activatedAt: '2026-01-10',
  },
  {
    id: 'comp2',
    name: 'Spicy Grill',
    packageId: 'pkg2',
    expiresAt: '2026-04-05',
    activatedAt: '2026-01-05',
  },
  {
    id: 'comp3',
    name: 'Addis Café',
    packageId: 'pkg1',
    expiresAt: '2026-03-01',
    activatedAt: '2026-02-01',
  },
];

const tierIcons = [
  <Coffee size={20} />,
  <Zap size={20} />,
  <Star size={20} />,
  <Building size={20} />,
];

/* ────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────── */
function daysLeft(expiry: string): number {
  const diff = new Date(expiry).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/* ────────────────────────────────────────────────
   MAIN DASHBOARD COMPONENT
───────────────────────────────────────────────── */
export default function SubscriptionPackageManagement() {
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [activeCompanies, setActiveCompanies] = useState<ActiveCompany[]>(initialActiveCompanies);

  const [pkgFormOpen, setPkgFormOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Package | null>(null);

  const [subscriptionDrawerOpen, setSubscriptionDrawerOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<ActiveCompany | null>(null);

  const [pkgForm, setPkgForm] = useState({
    name: '',
    price: '',
    durationMonths: '',
    maxRestaurants: '',
    description: '',
  });

  // ─── Package CRUD ───────────────────────────────────────
  const openPackageForm = (pkg?: Package) => {
    if (pkg) {
      setEditingPkg(pkg);
      setPkgForm({
        name: pkg.name,
        price: pkg.price.toString(),
        durationMonths: pkg.durationMonths.toString(),
        maxRestaurants: pkg.maxRestaurants.toString(),
        description: pkg.description,
      });
    } else {
      setEditingPkg(null);
      setPkgForm({ name: '', price: '', durationMonths: '', maxRestaurants: '', description: '' });
    }
    setPkgFormOpen(true);
  };

  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !pkgForm.name.trim() ||
      !pkgForm.price ||
      !pkgForm.durationMonths ||
      !pkgForm.maxRestaurants
    ) {
      alert('Please fill all required fields.');
      return;
    }

    const newPkg: Package = {
      id: editingPkg?.id || Date.now().toString(),
      name: pkgForm.name.trim(),
      price: Number(pkgForm.price),
      durationMonths: Number(pkgForm.durationMonths),
      maxRestaurants: Number(pkgForm.maxRestaurants),
      description: pkgForm.description.trim(),
    };

    setPackages((prev) =>
      editingPkg
        ? prev.map((p) => (p.id === editingPkg.id ? newPkg : p))
        : [...prev, newPkg]
    );

    setPkgFormOpen(false);
    setEditingPkg(null);
  };

  const handleDeletePackage = (id: string) => {
    if (!window.confirm('Delete this package? Companies may lose access.')) return;
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  // ─── Company Subscription Change ────────────────────────
  const changeCompanyPackage = (companyId: string, newPackageId: string) => {
    const pkg = packages.find((p) => p.id === newPackageId);
    if (!pkg) return;

    const newExpiry = new Date(
      Date.now() + pkg.durationMonths * 30.437 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split('T')[0];

    setActiveCompanies((prev) =>
      prev.map((c) =>
        c.id === companyId ? { ...c, packageId: newPackageId, expiresAt: newExpiry } : c
      )
    );

    setSelectedCompany((prev) =>
      prev && prev.id === companyId ? { ...prev, packageId: newPackageId, expiresAt: newExpiry } : prev
    );
  };

  // ─── RENDER ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/70 p-5 md:p-8">
      <div className="mx-auto max-w-7xl space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Subscription Management
            </h1>
            <p className="mt-1.5 text-gray-600">
              Manage plans and active company subscriptions
            </p>
          </div>
          <button
            onClick={() => openPackageForm()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-2.5 font-medium text-white shadow hover:from-orange-600 hover:to-orange-700 transition-colors"
          >
            <Plus size={18} /> New Package
          </button>
        </div>

        {/* ─── ACTIVE COMPANIES SECTION ─────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-5 border-b bg-gray-50/80">
            <h2 className="text-xl font-semibold flex items-center gap-2.5">
              <Building size={20} className="text-gray-700" />
              Active Companies
            </h2>
          </div>

          {activeCompanies.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No active companies yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {activeCompanies.map((comp) => {
                const pkg = packages.find((p) => p.id === comp.packageId);
                const days = daysLeft(comp.expiresAt);
                const isExpiringSoon = days > 0 && days <= 14;

                return (
                  <div
                    key={comp.id}
                    className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{comp.name}</div>
                      <div className="text-sm mt-1 flex flex-wrap gap-x-4 gap-y-1 text-gray-600">
                        <span className="font-medium">{pkg?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span
                          className={`font-medium ${
                            isExpiringSoon ? 'text-red-600' : 'text-gray-700'
                          }`}
                        >
                          {days} days left
                        </span>
                        <span className="text-gray-500">
                          • Expires {formatDate(comp.expiresAt)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCompany(comp);
                        setSubscriptionDrawerOpen(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 whitespace-nowrap transition-colors"
                    >
                      <CalendarClock size={16} />
                      Manage Subscription
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── PACKAGES SECTION ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="px-6 py-5 border-b bg-gray-50/80 flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2.5">
              <Zap size={20} className="text-gray-700" />
              Subscription Packages
            </h2>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {packages.map((pkg, i) => (
              <div
                key={pkg.id}
                className="group relative flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="absolute -top-px inset-x-0 h-1.5 rounded-t-xl bg-gradient-to-r from-gray-300 via-orange-400 to-orange-500" />

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
                      {tierIcons[i % tierIcons.length]}
                    </div>
                    <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openPackageForm(pkg)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-700 mt-auto">
                  <div className="text-2xl font-bold">
                    {pkg.price === 0 ? 'Free' : `${pkg.price.toLocaleString()} ETB`}
                  </div>
                  <div className="flex gap-4">
                    <div className="rounded bg-gray-100 px-2.5 py-1">
                      {pkg.durationMonths} mo
                    </div>
                    <div className="rounded bg-gray-100 px-2.5 py-1">
                      Max {pkg.maxRestaurants} restaurants
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mt-2">
                    {pkg.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── PACKAGE CREATE/EDIT DRAWER ───────────────────────────── */}
        {pkgFormOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setPkgFormOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl transform transition-transform duration-300">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b px-6 py-5">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingPkg ? 'Edit Package' : 'Create Package'}
                  </h2>
                  <button
                    onClick={() => setPkgFormOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSavePackage} className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Package Name *
                    </label>
                    <input
                      value={pkgForm.name}
                      onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-400 focus:ring-orange-400"
                      placeholder="e.g. Premium Plan"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Price (ETB) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={pkgForm.price}
                        onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-400 focus:ring-orange-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Duration (months) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={pkgForm.durationMonths}
                        onChange={(e) =>
                          setPkgForm({ ...pkgForm, durationMonths: e.target.value })
                        }
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-400 focus:ring-orange-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Max Restaurants *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={pkgForm.maxRestaurants}
                      onChange={(e) =>
                        setPkgForm({ ...pkgForm, maxRestaurants: e.target.value })
                      }
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-400 focus:ring-orange-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={pkgForm.description}
                      onChange={(e) =>
                        setPkgForm({ ...pkgForm, description: e.target.value })
                      }
                      rows={4}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-400 focus:ring-orange-400"
                      placeholder="Key features and limitations..."
                    />
                  </div>

                  <div className="sticky bottom-0 -mx-6 -mb-6 border-t bg-white px-6 py-5 flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-orange-500 py-3 font-medium text-white hover:bg-orange-600 transition-colors"
                    >
                      {editingPkg ? 'Update' : 'Create'} Package
                    </button>
                    <button
                      type="button"
                      onClick={() => setPkgFormOpen(false)}
                      className="flex-1 rounded-lg border py-3 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}

        {/* ─── SUBSCRIPTION MANAGEMENT DRAWER ──────────────────────────── */}
        {subscriptionDrawerOpen && selectedCompany && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setSubscriptionDrawerOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl">
              <div className="flex h-full flex-col p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Manage Subscription</h2>
                  <button
                    onClick={() => setSubscriptionDrawerOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="text-sm text-gray-500">Company</div>
                  <div className="text-xl font-semibold">{selectedCompany.name}</div>
                </div>

                <div className="bg-gray-50 border rounded-xl p-5 mb-6">
                  {(() => {
                    const pkg = packages.find((p) => p.id === selectedCompany.packageId);
                    const days = daysLeft(selectedCompany.expiresAt);
                    return (
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current Plan:</span>
                          <span className="font-semibold">{pkg?.name || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expires:</span>
                          <span className="font-semibold">
                            {formatDate(selectedCompany.expiresAt)}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-gray-600">Days remaining:</span>
                          <span
                            className={`font-bold ${
                              days <= 14 && days > 0 ? 'text-red-600' : ''
                            }`}
                          >
                            {days} days
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <h3 className="font-semibold mb-4">Change to another plan</h3>
                <div className="space-y-3 flex-1">
                  {packages.map((pkg) => {
                    const isCurrent = pkg.id === selectedCompany.packageId;
                    return (
                      <button
                        key={pkg.id}
                        disabled={isCurrent}
                        onClick={() => changeCompanyPackage(selectedCompany.id, pkg.id)}
                        className={`w-full text-left p-4 border rounded-xl transition-colors ${
                          isCurrent
                            ? 'bg-orange-50 border-orange-300 cursor-default'
                            : 'hover:bg-orange-50 border-gray-200'
                        }`}
                      >
                        <div className="font-medium flex items-center justify-between">
                          <span>{pkg.name}</span>
                          {isCurrent && (
                            <span className="text-xs text-orange-600 font-semibold">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {pkg.price === 0
                            ? 'Free'
                            : `${pkg.price.toLocaleString()} ETB`}{' '}
                          • {pkg.durationMonths} months
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setSubscriptionDrawerOpen(false)}
                  className="mt-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium w-full transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}