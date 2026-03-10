"use client";

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MoreVertical,
  ChevronDown,
  X,
  User,
  Briefcase,
  Mail,
  Phone,
  Building2,
  Calendar,
  Trash2,
  Edit,
  QrCode,
  Plus,
} from "lucide-react";
import AddEmployeeDrawer from "@/pages/company/CreateEmployee"; // ← your drawer component

// Hardcoded data (you'll replace this with real data later)
const initialEmployees = [
  {
    id: "1",
    firstName: "Natnaiel",
    lastName: "Kebede",
    role: "Waiter",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    email: "natnaiel@example.com",
    phone: "+251911234567",
    branch: "Boss burger",
    hireDate: "2025-06-15",
    salary: "8500",
    idNumber: "ET12345678",
  },
  {
    id: "2",
    firstName: "Kidist",
    lastName: "Abebe",
    role: "Cashier",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    email: "kidist@example.com",
    phone: "+251922345678",
    branch: "Boss burger",
    hireDate: "2025-07-01",
    salary: "9200",
    idNumber: "ET87654321",
  },
  // ... add more as needed
];

export default function EmployeeManagementPage() {
  const { id } = useParams<{ id: string }>();

  const [employees, setEmployees] = useState(initialEmployees);
  const [filterRole, setFilterRole] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewedEmployee, setViewedEmployee] = useState<any>(null);

  const displayedEmployees = employees.filter(
    (emp) => filterRole === "All" || emp.role === filterRole
  );

  const openAddDrawer = () => {
    setEditingEmployee(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (emp: any) => {
    setEditingEmployee(emp);
    setDrawerOpen(true);
    setMenuOpenId(null);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setMenuOpenId(null);
  };

  const handleView = (emp: any) => {
    setViewedEmployee(emp);
    setViewModalOpen(true);
    setMenuOpenId(null);
  };

  const handleSaveEmployee = (formData: any) => {
    if (editingEmployee) {
      // Update existing
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === editingEmployee.id ? { ...e, ...formData } : e
        )
      );
    } else {
      // Add new
      const newEmp = {
        id: Date.now().toString(),
        ...formData,
        avatar: formData.photo
          ? URL.createObjectURL(formData.photo)
          : `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
      };
      setEmployees([...employees, newEmp]);
    }
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Breadcrumb + Header */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
  <Link
    to="/"
    className="hover:text-gray-700 transition"
  >
    Dashboard
  </Link>

  <span>›</span>

  <Link
    to={`/company/${id}/branches`}
    className="hover:text-gray-700 transition"
  >
    Branch
  </Link>

  <span>›</span>

  <span className="text-orange-600 font-medium">
    Employees
  </span>
</div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Employee Management</h1>
            <button
              onClick={openAddDrawer}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus size={18} /> Add Employee
            </button>
          </div>
        </div>

        {/* Filter & Table Card */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          {/* Header with filter */}
          <div className="px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">All Employees</h2>
              <p className="text-sm text-gray-600 mt-1">
                {displayedEmployees.length} {filterRole === "All" ? "total" : filterRole.toLowerCase()} employees
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 min-w-[160px]"
                >
                  <option value="All">All Roles</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Chef">Chef</option>
                  <option value="Manager">Manager</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Employee List */}
          <div className="divide-y divide-gray-100">
            {displayedEmployees.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                No employees found in this role.
              </div>
            ) : (
              displayedEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors group relative"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img
                      src={emp.avatar}
                      alt={`${emp.firstName} ${emp.lastName}`}
                      className="w-11 h-11 rounded-full object-cover border border-gray-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="text-sm text-gray-600">{emp.role}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-500 hidden sm:block">
                      {emp.phone}
                    </div>

                    <button
                      onClick={() => setMenuOpenId(menuOpenId === emp.id ? null : emp.id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={18} className="text-gray-500" />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {menuOpenId === emp.id && (
                    <div className="absolute right-4 top-14 z-20 w-56 bg-white border rounded-lg shadow-xl py-1 text-sm">
                      <button
                        onClick={() => handleView(emp)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2.5"
                      >
                        <User size={16} /> View Profile
                      </button>
                      <button
                        onClick={() => openEditDrawer(emp)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2.5"
                      >
                        <Edit size={16} /> Edit Details
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                      >
                        <Trash2 size={16} /> Delete Employee
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ─── ADD / EDIT DRAWER ─────────────────────────────────────────── */}
      <AddEmployeeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSaveEmployee}
      />

      {/* ─── VIEW PROFILE MODAL ────────────────────────────────────────── */}
      {viewModalOpen && viewedEmployee && (
        <EmployeeProfileModal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          employee={viewedEmployee}
        />
      )}
    </div>
  );
}

/* ─── VIEW PROFILE MODAL ──────────────────────────────────────────────── */

function EmployeeProfileModal({
  isOpen,
  onClose,
  employee,
}: {
  isOpen: boolean;
  onClose: () => void;
  employee: any;
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div
        className={`
          fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <img
                src={employee.avatar}
                alt={employee.firstName}
                className="w-14 h-14 rounded-full object-cover border-2 border-orange-100"
              />
              <div>
                <h2 className="text-xl font-bold">
                  {employee.firstName} {employee.lastName}
                </h2>
                <p className="text-sm text-orange-600 font-medium">{employee.role}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoCard icon={<User />} label="Full Name" value={`${employee.firstName} ${employee.lastName}`} />
              <InfoCard icon={<Briefcase />} label="Position" value={employee.role} />
              <InfoCard icon={<Mail />} label="Email" value={employee.email} />
              <InfoCard icon={<Phone />} label="Phone" value={employee.phone} />
              <InfoCard icon={<Building2 />} label="Branch" value={employee.branch} />
              <InfoCard icon={<Calendar />} label="Hire Date" value={employee.hireDate} />
              <InfoCard icon={<QrCode />} label="ID Number" value={employee.idNumber} />
              <InfoCard icon={<span className="text-xl">ETB</span>} label="Monthly Salary" value={`${employee.salary || "—"}`} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="text-orange-600 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="font-medium text-gray-900 mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}