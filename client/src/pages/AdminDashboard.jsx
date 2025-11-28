export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-700">Admin Dashboard</h1>
      <p className="text-gray-700 mt-2">Welcome, {user?.name}</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-xl font-semibold">Manage Users</h2>
          <p className="text-gray-600">View, edit, or remove system users.</p>
        </div>

        <div className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-xl font-semibold">Appointments</h2>
          <p className="text-gray-600">Monitor all hospital appointments.</p>
        </div>

        <div className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-xl font-semibold">System Overview</h2>
          <p className="text-gray-600">General analytics & stats.</p>
        </div>
      </div>
    </div>
  );
}
