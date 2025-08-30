export default function GlobalStats() {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-nextgen-white">System Overview</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 p-4 rounded-lg">
          <h3 className="font-medium text-nextgen-white">Employee Management</h3>
          <p className="text-sm text-nextgen-light-gray mt-1">Manage user accounts and roles</p>
        </div>
        <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 p-4 rounded-lg">
          <h3 className="font-medium text-nextgen-white">System Settings</h3>
          <p className="text-sm text-nextgen-light-gray mt-1">Configure system preferences</p>
        </div>
        <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 p-4 rounded-lg">
          <h3 className="font-medium text-nextgen-white">Security Monitor</h3>
          <p className="text-sm text-nextgen-light-gray mt-1">View security logs and alerts</p>
        </div>
        <div className="bg-nextgen-medium-gray/20 border border-nextgen-light-gray/20 p-4 rounded-lg">
          <h3 className="font-medium text-nextgen-white">Data Export</h3>
          <p className="text-sm text-nextgen-light-gray mt-1">Export reports and backups</p>
        </div>
      </div>
    </section>
  );
}
