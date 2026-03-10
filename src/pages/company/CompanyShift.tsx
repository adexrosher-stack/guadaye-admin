import React, { useState } from 'react';
import { ChevronDown, X, Plus, Edit, Trash2, Clock, Calendar, Save } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

// Hardcoded initial data structure (one week)
const initialDays = [
  { day: 'Sunday', shifts: [
    { id: 's1', name: 'Morning', time: '08:00:00 - 15:00:00' },
    { id: 's2', name: 'Night', time: '15:00:00 - 22:00:00' },
  ]},
  { day: 'Monday', shifts: [
    { id: 's3', name: 'Morning', time: '08:00:00 - 15:00:00' },
    { id: 's4', name: 'Night', time: '15:00:00 - 22:00:00' },
  ]},
  // Repeat for other days...
];

export default function ShiftsPage() {
  const { companyId, branchId } = useParams();
  const branches = [{ id: '3', name: 'SJDH' }];
  const branch = branches.find((b) => b.id === branchId);
  const branchName = branch ? branch.name : 'Branch';

  const [days, setDays] = useState(initialDays);
  const [openDays, setOpenDays] = useState<string[]>(['Sunday']);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<any>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewedShift, setViewedShift] = useState<any>(null);

  const [newShiftForm, setNewShiftForm] = useState({
    day: 'Sunday',
    name: '',
    startTime: '',
    endTime: '',
  });

  const toggleDay = (day: string) => {
    setOpenDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // ─── CRUD Handlers ────────────────────────────────────────────────

  const handleAddShift = () => {
    setEditingShift(null);
    setNewShiftForm({ day: 'Sunday', name: '', startTime: '', endTime: '' });
    setDrawerOpen(true);
  };

  const handleEditShift = (shift: any, day: string) => {
    setEditingShift({ ...shift, day });
    setNewShiftForm({
      day,
      name: shift.name,
      startTime: shift.time.split(' - ')[0],
      endTime: shift.time.split(' - ')[1],
    });
    setDrawerOpen(true);
    setMenuOpenId(null);
  };

  const handleDeleteShift = (shiftId: string, dayName: string) => {
    if (!window.confirm('Delete this shift?')) return;

    setDays(prev =>
      prev.map(day =>
        day.day === dayName
          ? { ...day, shifts: day.shifts.filter(s => s.id !== shiftId) }
          : day
      )
    );
    setMenuOpenId(null);
  };

  const handleViewShift = (shift: any, day: string) => {
    setViewedShift({ ...shift, day });
    setViewModalOpen(true);
    setMenuOpenId(null);
  };

  const handleSaveShift = () => {
    const { day, name, startTime, endTime } = newShiftForm;

    if (!name.trim() || !startTime || !endTime) {
      alert('Please fill all fields');
      return;
    }

    const time = `${startTime} - ${endTime}`;

    if (editingShift) {
      // Update existing
      setDays(prev =>
        prev.map(d =>
          d.day === day
            ? {
                ...d,
                shifts: d.shifts.map(s =>
                  s.id === editingShift.id ? { ...s, name, time } : s
                ),
              }
            : d
        )
      );
    } else {
      // Create new
      const newShift = {
        id: Date.now().toString(),
        name,
        time,
      };
      setDays(prev =>
        prev.map(d =>
          d.day === day ? { ...d, shifts: [...d.shifts, newShift] } : d
        )
      );
    }

    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shifts</h1>
            <p className="text-sm text-gray-600 mt-1">
              Use this section to view the shifts of your branch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Branch: <span className="font-medium text-gray-900">{branchName}</span>
            </div>
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
          <span className="text-orange-600">Shifts</span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">List of created shifts</h2>
            <button
              onClick={handleAddShift}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <Plus size={16} /> Add Shift
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {days.map(item => {
              const isOpen = openDays.includes(item.day);

              return (
                <div key={item.day}>
                  <button
                    onClick={() => toggleDay(item.day)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">📅</span>
                      <span className="font-medium text-gray-900">{item.day}</span>
                    </div>
                    <span className={`text-orange-500 text-lg transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 bg-gray-50/40">
                      {item.shifts.length === 0 ? (
                        <p className="text-sm text-gray-500 italic text-center py-4">
                          No shifts created for this day.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {item.shifts.map(shift => (
                            <div
                              key={shift.id}
                              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-between group relative"
                            >
                              <div>
                                <div className="font-medium text-gray-900">{shift.name}</div>
                                <div className="text-sm text-gray-600 font-mono mt-1">
                                  {shift.time}
                                </div>
                              </div>

                              <button
                                onClick={() => setMenuOpenId(menuOpenId === shift.id ? null : shift.id)}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ChevronDown size={20} />
                              </button>

                              {menuOpenId === shift.id && (
                                <div className="absolute right-10 top-10 z-20 w-56 bg-white border rounded-lg shadow-lg py-1">
                                  <button
                                    onClick={() => handleViewShift(shift, item.day)}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Calendar size={16} /> View Details
                                  </button>
                                  <button
                                    onClick={() => handleAssignShift(shift)}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Clock size={16} /> Assign Shift
                                  </button>
                                  <button
                                    onClick={() => handleEditShift(shift, item.day)}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                                  >
                                    <Edit size={16} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteShift(shift.id, item.day)}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                  >
                                    <Trash2 size={16} /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ─── Right Drawer for Add / Edit Shift ──────────────────────────────────────── */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300">
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingShift ? 'Edit Shift' : 'Create New Shift'}
                </h2>
                <button onClick={() => setDrawerOpen(false)}>
                  <X className="text-3xl text-gray-500 hover:text-gray-800" />
                </button>
              </div>

              <div className="space-y-6 flex-1">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Day</label>
                  <select
                    value={newShiftForm.day}
                    onChange={e => setNewShiftForm({ ...newShiftForm, day: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Shift Name</label>
                  <input
                    type="text"
                    value={newShiftForm.name}
                    onChange={e => setNewShiftForm({ ...newShiftForm, name: e.target.value })}
                    placeholder="e.g. Morning, Evening, Full Day..."
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Start Time</label>
                    <input
                      type="time"
                      value={newShiftForm.startTime}
                      onChange={e => setNewShiftForm({ ...newShiftForm, startTime: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">End Time</label>
                    <input
                      type="time"
                      value={newShiftForm.endTime}
                      onChange={e => setNewShiftForm({ ...newShiftForm, endTime: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <button
                  onClick={handleSaveShift}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {editingShift ? 'Update Shift' : 'Create Shift'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── View Shift Details Modal ──────────────────────────────────────────────── */}
      {viewModalOpen && viewedShift && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setViewModalOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300">
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Shift Details</h2>
                <button onClick={() => setViewModalOpen(false)}>
                  <X className="text-3xl text-gray-500 hover:text-gray-800" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-lg border">
                  <div className="space-y-3 text-sm">
                    <div><strong>Day:</strong> {viewedShift.day}</div>
                    <div><strong>Shift:</strong> {viewedShift.name}</div>
                    <div><strong>Time:</strong> <span className="font-mono">{viewedShift.time}</span></div>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-auto border-t">
                <button
                  onClick={() => setViewModalOpen(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
