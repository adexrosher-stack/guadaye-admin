// TableManagementPage.tsx
import React, { useState } from 'react';
import { MoreVertical, ChevronDown, X, Plus, Edit, Trash2, QrCode } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

// Hardcoded initial tables
const initialTables = [
  { id: 't1', name: 'one' },
  { id: 't2', name: 'Table 1' },
  { id: 't3', name: 'Table 2' },
  { id: 't4', name: 'Table 3' },
  { id: 't5', name: 'Table 4' },
  { id: 't6', name: 'Table 5' },
];

export default function TableManagementPage() {
  const { companyId, branchId } = useParams();
  const branches = [{ id: '3', name: 'SJDH' }];
  const branch = branches.find((b) => b.id === branchId);
  const branchName = branch ? branch.name : 'Branch';

  const [tables, setTables] = useState(initialTables);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [qrDrawerOpen, setQrDrawerOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<any>(null);
  const [selectedTableForQr, setSelectedTableForQr] = useState<any>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [newTableName, setNewTableName] = useState('');

  // Create or update table
  const handleSaveTable = () => {
    if (!newTableName.trim()) {
      alert('Table name is required');
      return;
    }

    if (editingTable) {
      setTables(prev =>
        prev.map(t =>
          t.id === editingTable.id ? { ...t, name: newTableName.trim() } : t
        )
      );
    } else {
      const newTable = {
        id: Date.now().toString(),
        name: newTableName.trim(),
      };
      setTables(prev => [...prev, newTable]);
    }

    setDrawerOpen(false);
    setEditingTable(null);
    setNewTableName('');
  };

  // Delete table
  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this table?')) return;
    setTables(prev => prev.filter(t => t.id !== id));
    setMenuOpenId(null);
  };

  // Open drawer for create
  const openCreate = () => {
    setEditingTable(null);
    setNewTableName('');
    setDrawerOpen(true);
  };

  // Open drawer for edit
  const openEdit = (table: any) => {
    setEditingTable(table);
    setNewTableName(table.name);
    setDrawerOpen(true);
    setMenuOpenId(null);
  };

  // Open QR drawer
  const openQrCode = (table: any) => {
    setSelectedTableForQr(table);
    setQrDrawerOpen(true);
    setMenuOpenId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage all tables for your branch, including creating, editing, and removing tables.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white min-w-[160px]">
              <option>Name (A-Z)</option>
              <option>Name (Z-A)</option>
            </select>

            <select className="border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white min-w-[160px]">
              <option>{branchName}</option>
            </select>

            <button
              onClick={openCreate}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 shadow-sm"
            >
              Create Table
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link to="/company" className="hover:text-gray-700">
            Dashboard
          </Link>{' '}
          &gt;{' '}
          <Link
            to={`/company/${companyId}/branches`}
            className="hover:text-gray-700"
          >
            {branchName}
          </Link>{' '}
          &gt;{' '}
          <span className="text-orange-600">Table Management</span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Table</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {tables.map(table => (
              <div
                key={table.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors relative"
              >
                <div className="font-medium text-gray-900">{table.name}</div>

                <button
                  onClick={() => setMenuOpenId(menuOpenId === table.id ? null : table.id)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
                >
                  <MoreVertical size={20} />
                </button>

                {menuOpenId === table.id && (
                  <div className="absolute right-10 top-10 z-20 w-56 bg-white border rounded-lg shadow-lg py-1">
                    <button
                      onClick={() => openEdit(table)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => openQrCode(table)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <QrCode size={16} /> Create QR Code
                    </button>
                    <button
                      onClick={() => handleDelete(table.id)}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}

            {tables.length === 0 && (
              <div className="py-16 text-center text-gray-500">
                No tables created yet.
              </div>
            )}
          </div>

          {/* Pagination (static) */}
          <div className="px-6 py-5 border-t flex justify-center items-center gap-4">
            <button
              disabled
              className="px-5 py-2 border border-gray-300 rounded-md text-gray-400 cursor-not-allowed text-sm"
            >
              Previous
            </button>
            <button className="px-5 py-2 bg-orange-500 text-white rounded-md font-medium min-w-[40px] text-sm">
              1
            </button>
            <button className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm">
              Next
            </button>
          </div>
        </div>
      </main>

      {/* ─── Right Drawer for Create / Edit Table ──────────────────────────────────────── */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300">
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingTable ? 'Edit Table' : 'Create New Table'}
                </h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="text-3xl text-gray-500 hover:text-gray-800"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Table Name</label>
                  <input
                    type="text"
                    value={newTableName}
                    onChange={e => setNewTableName(e.target.value)}
                    placeholder="e.g. VIP Table 1"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    autoFocus
                  />
                </div>
              </div>

              <div className="pt-6 border-t">
                <button
                  onClick={handleSaveTable}
                  disabled={!newTableName.trim()}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {editingTable ? 'Save Changes' : 'Create Table'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── Right Drawer for QR Code ──────────────────────────────────────────────────── */}
      {qrDrawerOpen && selectedTableForQr && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setQrDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300">
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">QR Code for {selectedTableForQr.name}</h2>
                <button
                  onClick={() => setQrDrawerOpen(false)}
                  className="text-3xl text-gray-500 hover:text-gray-800"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center gap-8">
                {/* Placeholder QR Code (replace with real QR generation later) */}
                <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center border-4 border-gray-300">
                  <div className="text-center text-gray-500">
                    <QrCode size={120} />
                    <p className="mt-4 text-sm">QR Code for {selectedTableForQr.name}</p>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-600">
                  Scan this code to access table details, menu, or ordering.
                </div>

                <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 shadow-sm">
                  Download QR Code
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}