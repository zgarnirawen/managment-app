import { useEffect, useState } from 'react';

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department?: { name: string };
  role?: { name: string };
};

export default function EmployeesTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', position: '' });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', position: '' });

  async function fetchEmployees() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/employees');
      const data = await res.json();
      if (res.ok) setEmployees(data);
      else setError(data.error || 'Failed to fetch employees');
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, hireDate: new Date().toISOString() }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ firstName: '', lastName: '', email: '', position: '' });
        fetchEmployees();
      } else {
        setError(data.error || 'Failed to add employee');
      }
    } catch (err) {
      setError('Network error');
    }
    setSubmitting(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Delete this employee?')) return;
    setError(null);
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) fetchEmployees();
      else setError(data.error || 'Failed to delete employee');
    } catch (err) {
      setError('Network error');
    }
  }

  function startEdit(emp: Employee) {
    setEditingId(emp.id);
    setEditForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      position: emp.position,
    });
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/employees/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        setEditingId(null);
        fetchEmployees();
      } else {
        setError(data.error || 'Failed to update employee');
      }
    } catch (err) {
      setError('Network error');
    }
    setSubmitting(false);
  }

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-2">Employees</h2>
      <form className="mb-4 flex gap-2 flex-wrap items-end" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="First Name"
          className="border rounded px-2 py-1"
          value={form.firstName}
          onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          className="border rounded px-2 py-1"
          value={form.lastName}
          onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="border rounded px-2 py-1"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          type="text"
          placeholder="Position"
          className="border rounded px-2 py-1"
          value={form.position}
          onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
          required
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-1 rounded font-semibold"
          disabled={submitting}
        >
          {submitting ? 'Adding...' : 'Add Employee'}
        </button>
      </form>
      {loading ? (
        <div className="p-4">Loading...</div>
      ) : error ? (
        <div className="p-4 text-red-600">{error}</div>
      ) : (
        <table className="min-w-full border rounded bg-white">
          <thead>
            <tr className="bg-purple-100">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Position</th>
              <th className="p-2 text-left">Department</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} className="border-t">
                {editingId === emp.id ? (
                  <>
                    <td className="p-2" colSpan={3}>
                      <form className="flex gap-2" onSubmit={handleEditSubmit}>
                        <input
                          type="text"
                          className="border rounded px-2 py-1"
                          value={editForm.firstName}
                          onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                          required
                        />
                        <input
                          type="text"
                          className="border rounded px-2 py-1"
                          value={editForm.lastName}
                          onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                          required
                        />
                        <input
                          type="email"
                          className="border rounded px-2 py-1"
                          value={editForm.email}
                          onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                          required
                        />
                        <input
                          type="text"
                          className="border rounded px-2 py-1"
                          value={editForm.position}
                          onChange={e => setEditForm(f => ({ ...f, position: e.target.value }))}
                          required
                        />
                        <button
                          type="submit"
                          className="bg-purple-600 text-white px-4 py-1 rounded font-semibold"
                          disabled={submitting}
                        >
                          {submitting ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          className="bg-gray-400 text-white px-2 py-1 rounded"
                          onClick={() => setEditingId(null)}
                        >Cancel</button>
                      </form>
                    </td>
                    <td className="p-2" colSpan={3}></td>
                  </>
                ) : (
                  <>
                    <td className="p-2">{emp.firstName} {emp.lastName}</td>
                    <td className="p-2">{emp.email}</td>
                    <td className="p-2">{emp.position}</td>
                    <td className="p-2">{emp.department?.name || '-'}</td>
                    <td className="p-2">{emp.role?.name || '-'}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => startEdit(emp)}
                      >Edit</button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleDelete(emp.id)}
                      >Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
