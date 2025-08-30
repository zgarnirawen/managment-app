'use client';

import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Calendar, Plus } from 'lucide-react';
import LeaveRequestForm from '../../components/forms/LeaveRequestForm';

export default function LeaveRequestSection() {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Request Time Off
        </h2>
        <Button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      <div className="space-y-4">
        <div className="text-sm text-gray-600">
          <p>Submit leave requests for approval by your manager.</p>
          <p className="mt-1">💡 Tip: Submit requests at least 2 weeks in advance when possible.</p>
        </div>

        {/* Recent Leave Requests Summary */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium mb-2">Leave Request Guidelines</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Submit requests at least 2 weeks in advance</li>
            <li>• Emergency requests will be reviewed promptly</li>
            <li>• You'll receive email notifications on status changes</li>
            <li>• Contact your manager for urgent situations</li>
          </ul>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-semibold text-blue-700">0</div>
            <div className="text-xs text-blue-600">Pending Requests</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-semibold text-green-700">0</div>
            <div className="text-xs text-green-600">Days Used This Year</div>
          </div>
        </div>
      </div>

      {/* Leave Request Form Modal */}
      <LeaveRequestForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          // Could add a success toast here
        }}
        employeeId="cmets2l7w0001mhu87uxes32j" // This should be dynamic based on current user
      />
    </section>
  );
}
