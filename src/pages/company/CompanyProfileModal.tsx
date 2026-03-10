// src/pages/company/CompanyProfileModal.tsx
import React, { useState } from 'react';
import { X, Building2, Calendar, AlertCircle } from 'lucide-react';

export type Package = {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  maxRestaurants: number;
  description: string;
};

export type CompanyItem = {
  id: number | string;
  name: string;
  tin?: string;
  company_website?: string;
  company_logo?: string;
  package?: string;          // display name
  packageId?: string;        // actual ID
  expiresAt?: string;        // YYYY-MM-DD
  activatedAt?: string;
  created_at: string;
  updated_at?: string;
};

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyItem;
  packages: Package[];                      // ← list of all available plans
  changeCompanyPackage: (
    companyId: string | number,
    newPackageId: string
  ) => void;                                // ← function to change plan
}

export default function CompanyProfileModal({
  isOpen,
  onClose,
  company,
  packages,
  changeCompanyPackage,
}: CompanyProfileModalProps) {
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  if (!isOpen) return null;

  const currentPlan = packages.find(p => p.id === company.packageId);

  const daysLeft = company.expiresAt
    ? Math.max(0, Math.ceil(
        (new Date(company.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))
    : null;

  const isExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 14;
  const isExpired = daysLeft !== null && daysLeft <= 0;

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) : '—';

  const handlePlanChange = (newPackageId: string) => {
    if (window.confirm(`Change ${company.name}'s plan?`)) {
      changeCompanyPackage(company.id, newPackageId);
      setIsChangingPlan(false);
      // Note: You might want to refresh company list after change
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              {company.company_logo ? (
                <img
                  src={company.company_logo}
                  alt={company.name}
                  className="h-12 w-12 rounded-full object-cover border"
                />
              ) : (
                <Building2 className="h-12 w-12 text-gray-400" />
              )}
              <div>
                <h2 className="text-2xl font-bold">{company.name}</h2>
                <p className="text-sm text-gray-500">ID: {company.id}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-8">
            {/* Basic Information */}
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 size={20} /> Company Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-gray-500">TIN</div>
                  <div className="font-medium mt-1">{company.tin || '—'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Website</div>
                  {company.company_website ? (
                    <a
                      href={company.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline mt-1 block"
                    >
                      {company.company_website}
                    </a>
                  ) : (
                    <div className="mt-1">—</div>
                  )}
                </div>
                <div>
                  <div className="text-gray-500">Created</div>
                  <div className="font-medium mt-1">
                    {formatDate(company.created_at)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Last Updated</div>
                  <div className="font-medium mt-1">
                    {formatDate(company.updated_at)}
                  </div>
                </div>
              </div>
            </section>

            {/* Subscription Section */}
            <section className="border rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar size={20} /> Subscription & Plan
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {company.packageId && currentPlan ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <div className="text-gray-500 text-sm">Current Plan</div>
                        <div className="font-semibold text-lg mt-1">
                          {currentPlan.name}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-sm">Expires</div>
                        <div className="font-medium mt-1">
                          {formatDate(company.expiresAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-sm">Days Left</div>
                        <div
                          className={`font-bold text-lg mt-1 ${
                            isExpired
                              ? 'text-red-600'
                              : isExpiringSoon
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          {isExpired ? 'Expired' : `${daysLeft} days`}
                          {isExpiringSoon && !isExpired && (
                            <AlertCircle className="inline h-4 w-4 ml-1.5 text-orange-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Change Plan Toggle */}
                    <div>
                      <button
                        onClick={() => setIsChangingPlan(!isChangingPlan)}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1.5"
                      >
                        {isChangingPlan ? 'Cancel' : 'Change Plan'}
                      </button>

                      {isChangingPlan && (
                        <div className="mt-5 space-y-3">
                          {packages.map(pkg => {
                            const isCurrent = pkg.id === company.packageId;
                            return (
                              <button
                                key={pkg.id}
                                disabled={isCurrent}
                                onClick={() => handlePlanChange(pkg.id)}
                                className={`w-full p-4 text-left border rounded-lg transition-colors ${
                                  isCurrent
                                    ? 'bg-orange-50 border-orange-300 cursor-default'
                                    : 'border-gray-200 hover:bg-orange-50 hover:border-orange-200'
                                }`}
                              >
                                <div className="font-medium flex justify-between">
                                  <span>{pkg.name}</span>
                                  {isCurrent && (
                                    <span className="text-xs text-orange-700 font-semibold">
                                      Current
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {pkg.price === 0 ? 'Free' : `${pkg.price.toLocaleString()} ETB`} • {pkg.durationMonths} months
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No subscription information available
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
