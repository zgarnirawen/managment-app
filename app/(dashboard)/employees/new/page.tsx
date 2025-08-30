'use client';

import { useState } from 'react';
import { Button } from '../../../components/ui/button';

export default function AddEmployeePage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    departmentId: '',
    role: '',
    phone: '',
    hireDate: '',
  });

  // Placeholder: handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // await fetch('/api/employees', { method: 'POST', body: JSON.stringify(form) });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Add Employee</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="input" />
        <input type="text" placeholder="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="input" />
        <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="input" />
        <input type="text" placeholder="Position" value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="input" />
        <input type="text" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input" />
        <input type="date" placeholder="Hire Date" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })} className="input" />
        <Button type="submit">Create Employee</Button>
      </form>
    </div>
  );
}
