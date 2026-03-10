"use client";

import { useState, useRef } from "react";
import { X, Camera, Trash2, Loader2 } from "lucide-react";

interface EmployeeFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  position: string;
  salary: string;
  hireDate: string;
  idNumber: string;
  guarantorName: string;
  guarantorRelationship: string;
  photo?: File | null;
  idFront?: File | null;
  idBack?: File | null;
  guarantorIdFront?: File | null;
  guarantorIdBack?: File | null;
  agreement?: File | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: EmployeeFormData) => Promise<void> | void;
}

export default function AddEmployeeDrawer({ open, onClose, onSubmit }: Props) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    position: "",
    salary: "",
    hireDate: "",
    idNumber: "",
    guarantorName: "",
    guarantorRelationship: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [previews, setPreviews] = useState<{
    photo?: string;
    idFront?: string;
    idBack?: string;
    guarantorIdFront?: string;
    guarantorIdBack?: string;
    agreement?: string;
  }>({});

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof EmployeeFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof typeof previews
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [field]: url }));
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  const removeImage = (field: keyof typeof previews) => {
    setPreviews((prev) => {
      const newPreviews = { ...prev };
      if (newPreviews[field]) URL.revokeObjectURL(newPreviews[field]!);
      delete newPreviews[field];
      return newPreviews;
    });
    setFormData((prev) => ({ ...prev, [field]: null }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof EmployeeFormData, string>> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.position) newErrors.position = "Please select a position";
    if (!formData.salary.trim()) newErrors.salary = "Salary is required";
    if (!formData.hireDate) newErrors.hireDate = "Hire date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        console.log("Form submitted:", formData);
        alert("Employee added (demo mode)");
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Right-side sliding drawer */}
      <div
        className={`
          fixed inset-y-0 right-0 z-50 w-full max-w-md lg:max-w-lg
          bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
            <h2 className="text-xl font-semibold">Add New Employee</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Profile Photo */}
            <div className="mb-10 flex flex-col items-center">
              <ImageUploadBox
                label="Employee Photo"
                preview={previews.photo}
                onRemove={() => removeImage("photo")}
                onFileChange={(e) => handleFileChange(e, "photo")}
                rounded
                size="lg"
              />
            </div>

            {/* Basic Info */}
            <div className="space-y-5 mb-10">
              <FormField label="First Name" error={errors.firstName}>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter first name"
                />
              </FormField>

              <FormField label="Last Name" error={errors.lastName}>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter last name"
                />
              </FormField>

              <FormField label="Phone Number" error={errors.phone}>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="+251 9xx xxx xxxx"
                />
              </FormField>

              <FormField label="Email Address" error={errors.email}>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="employee@company.com"
                />
              </FormField>

              <FormField label="Job Position" error={errors.position}>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select position</option>
                  <option value="waiter">Waiter / Waitress</option>
                  <option value="cashier">Cashier</option>
                  <option value="chef">Chef / Cook</option>
                  <option value="manager">Branch Manager</option>
                  <option value="barista">Barista</option>
                  <option value="cleaner">Cleaner</option>
                </select>
              </FormField>

              <FormField label="Monthly Salary (ETB)" error={errors.salary}>
                <input
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g. 8500"
                />
              </FormField>

              <FormField label="Hire Date" error={errors.hireDate}>
                <input
                  name="hireDate"
                  type="date"
                  value={formData.hireDate}
                  onChange={handleChange}
                  className="input"
                />
              </FormField>

              <FormField label="ID / Passport Number" error={errors.idNumber}>
                <input
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  className="input"
                  placeholder="ID / Passport number"
                />
              </FormField>
            </div>

            {/* ID Documents */}
            <Section title="Identification Documents">
              <div className="grid grid-cols-2 gap-5">
                <ImageUploadBox
                  label="ID / Passport Front"
                  preview={previews.idFront}
                  onRemove={() => removeImage("idFront")}
                  onFileChange={(e) => handleFileChange(e, "idFront")}
                />
                <ImageUploadBox
                  label="ID / Passport Back"
                  preview={previews.idBack}
                  onRemove={() => removeImage("idBack")}
                  onFileChange={(e) => handleFileChange(e, "idBack")}
                />
              </div>
            </Section>

            {/* Guarantor */}
            <Section title="Guarantor Information">
              <div className="space-y-5 mb-6">
                <FormField label="Guarantor Full Name">
                  <input
                    name="guarantorName"
                    value={formData.guarantorName}
                    onChange={handleChange}
                    className="input"
                    placeholder="Full name of guarantor"
                  />
                </FormField>

                <FormField label="Relationship">
                  <input
                    name="guarantorRelationship"
                    value={formData.guarantorRelationship}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g. Parent, Sibling, Friend"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <ImageUploadBox
                  label="Guarantor ID Front"
                  preview={previews.guarantorIdFront}
                  onRemove={() => removeImage("guarantorIdFront")}
                  onFileChange={(e) => handleFileChange(e, "guarantorIdFront")}
                />
                <ImageUploadBox
                  label="Guarantor ID Back"
                  preview={previews.guarantorIdBack}
                  onRemove={() => removeImage("guarantorIdBack")}
                  onFileChange={(e) => handleFileChange(e, "guarantorIdBack")}
                />
              </div>
            </Section>

            {/* Agreement */}
            <Section title="Employment Agreement">
              <ImageUploadBox
                label="Upload Signed Agreement"
                preview={previews.agreement}
                onRemove={() => removeImage("agreement")}
                onFileChange={(e) => handleFileChange(e, "agreement")}
                full
              />
            </Section>
          </div>

          {/* Submit Button */}
          <div className="p-6 border-t bg-gray-50">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`
                w-full py-3.5 rounded-xl font-medium text-white flex items-center justify-center gap-2
                transition-all
                ${isSubmitting
                  ? "bg-orange-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700 active:bg-orange-800"}
              `}
            >
              {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
              {isSubmitting ? "Saving..." : "Add Employee"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ──────────────────────────────────────────────
   Reusable Components
────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-10">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">{title}</h3>
      {children}
    </div>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

function ImageUploadBox({
  label,
  preview,
  onRemove,
  onFileChange,
  rounded = false,
  size = "md",
  full = false,
}: {
  label: string;
  preview?: string;
  onRemove: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  rounded?: boolean;
  size?: "md" | "lg";
  full?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={full ? "col-span-2" : ""}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        hidden
        onChange={onFileChange}
      />

      {preview ? (
        <div className="relative group">
          <div
            className={`
              rounded-xl overflow-hidden border border-gray-200 shadow-sm
              ${rounded ? "rounded-full" : ""}
              ${size === "lg" ? "h-32 w-32 mx-auto" : "h-28 w-full"}
            `}
          >
            <img
              src={preview}
              alt={label}
              className="h-full w-full object-cover"
            />
          </div>
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed border-gray-300 rounded-xl
            flex flex-col items-center justify-center cursor-pointer
            hover:border-orange-400 hover:bg-orange-50/30 transition-colors
            ${rounded ? "rounded-full" : ""}
            ${size === "lg" ? "h-32 w-32 mx-auto" : "h-28 w-full"}
            ${full ? "aspect-video" : ""}
          `}
        >
          <Camera className="h-7 w-7 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500 text-center px-4">
            {label}
          </span>
          <span className="text-xs text-gray-400 mt-1">Click to upload</span>
        </div>
      )}
    </div>
  );
}