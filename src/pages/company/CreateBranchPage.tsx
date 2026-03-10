  "use client";

  import { useState, FormEvent } from "react";
  import {
    Building2,
    MapPin,
    Phone,
    DollarSign,
    Clock,
    Utensils,
    Loader2,
  } from "lucide-react";

  type BranchType = "restaurant" | "main_kitchen" | "main_store";

  interface BranchFormData {
    name: string;
    location: string;
    phone: string;
    displayType?: "ticket" | "display" | "both";
    currency: string;
    openTime: string;
    closeTime: string;
  }

  interface CreateBranchFormProps {
    branchType: BranchType;
    onSubmit?: (data: BranchFormData) => Promise<void> | void;
    onSuccess?: () => void;           // optional callback after success
  }

  const INITIAL_FORM_DATA: BranchFormData = {
    name: "",
    location: "",
    phone: "",
    currency: "ETB",
    openTime: "08:00",
    closeTime: "22:00",
  };

  export default function CreateBranchForm({
    branchType,
    onSubmit,
    onSuccess,
  }: CreateBranchFormProps) {
    const [formData, setFormData] = useState<BranchFormData>({
      ...INITIAL_FORM_DATA,
      ...(branchType === "restaurant" ? { displayType: "ticket" } : {}),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof BranchFormData, string>>>({});
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error on change
      if (errors[name as keyof BranchFormData]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    };

    const validateForm = (): boolean => {
      const newErrors: Partial<Record<keyof BranchFormData, string>> = {};

      if (!formData.name.trim()) {
        newErrors.name = "Branch name is required";
      } else if (formData.name.trim().length < 3) {
        newErrors.name = "Name must be at least 3 characters";
      }

      if (!formData.location.trim()) {
        newErrors.location = "Location is required";
      }

      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\+2519\d{8}$/.test(formData.phone.replace(/\s/g, ""))) {
        // Very Ethiopia-specific basic validation — adjust as needed
        newErrors.phone = "Please enter a valid Ethiopian phone (+2519... )";
      }

      if (!formData.currency.trim()) {
        newErrors.currency = "Currency is required";
      }

      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(formData.openTime)) {
        newErrors.openTime = "Invalid time (use HH:MM 24h format)";
      }
      if (!timeRegex.test(formData.closeTime)) {
        newErrors.closeTime = "Invalid time (use HH:MM 24h format)";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      setSubmitSuccess(false);

      if (!validateForm()) return;

      if (!onSubmit) {
        console.log("Form data:", formData);
        alert("Form submitted (demo mode - no onSubmit provided)");
        setSubmitSuccess(true);
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(formData);
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          ...INITIAL_FORM_DATA,
          ...(branchType === "restaurant" ? { displayType: "ticket" } : {}),
        });
        onSuccess?.();
      } catch (err) {
        console.error("Branch creation failed:", err);
        alert("Failed to create branch. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
            Branch created successfully!
          </div>
        )}

        {/* Branch Name */}
        <FormField icon={<Building2 />} label="Branch Name" error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="input"
            placeholder="e.g. Rosher Downtown"
            disabled={isSubmitting}
            required
            minLength={3}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
        </FormField>

        {/* Location */}
        <FormField icon={<MapPin />} label="Location" error={errors.location}>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            className="input"
            placeholder="e.g. Bole Road, Addis Ababa"
            disabled={isSubmitting}
            required
            aria-invalid={!!errors.location}
          />
        </FormField>

        {/* Phone */}
        <FormField icon={<Phone />} label="Phone Number" error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="input"
            placeholder="+251912345678"
            disabled={isSubmitting}
            required
            aria-invalid={!!errors.phone}
          />
        </FormField>

        {/* Display Type - Restaurant only */}
        {branchType === "restaurant" && (
          <FormField icon={<Utensils />} label="Display Type">
            <select
              id="displayType"
              name="displayType"
              value={formData.displayType ?? "ticket"}
              onChange={handleChange}
              className="input"
              disabled={isSubmitting}
            >
              <option value="ticket">Ticket</option>
              <option value="display">Display</option>
              <option value="both">Both</option>
            </select>
          </FormField>
        )}

        {/* Currency */}
        <FormField icon={<DollarSign />} label="Branch Currency" error={errors.currency}>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="input"
            disabled={isSubmitting}
            required
          >
            <option value="ETB">ETB - Ethiopian Birr</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
          </select>
        </FormField>

        {/* Operating Hours */}
        <FormField
          icon={<Clock />}
          label="Operating Hours"
          error={errors.openTime || errors.closeTime}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="openTime" className="sr-only">
                Opening time
              </label>
              <input
                id="openTime"
                name="openTime"
                type="time"
                value={formData.openTime}
                onChange={handleChange}
                className="input"
                disabled={isSubmitting}
                required
              />
            </div>
            <div>
              <label htmlFor="closeTime" className="sr-only">
                Closing time
              </label>
              <input
                id="closeTime"
                name="closeTime"
                type="time"
                value={formData.closeTime}
                onChange={handleChange}
                className="input"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
        </FormField>

        {/* Branch Type Badge */}
        <div className="rounded-xl border bg-green-50/70 p-4 text-green-800 flex items-center gap-3">
          <Utensils className="w-5 h-5" />
          <span className="font-medium capitalize">
            {branchType.replace("_", " ")}
          </span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            w-full flex items-center justify-center gap-2 
            py-3 px-6 rounded-lg font-medium text-white shadow-sm
            transition-all
            ${isSubmitting
              ? "bg-orange-400 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700 active:bg-orange-800"
            }
          `}
        >
          {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
          {isSubmitting ? "Creating branch..." : "Create Branch"}
        </button>
      </form>
    );
  }

  function FormField({
    label,
    icon,
    children,
    error,
  }: {
    label: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    error?: string;
  }) {
    return (
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <span className="text-orange-500">{icon}</span>
          {label}
        </label>
        {children}
        {error && (
          <p id={`${label.toLowerCase()}-error`} className="text-red-600 text-xs mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }