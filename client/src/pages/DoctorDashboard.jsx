export default function DoctorDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-green-700">Doctor Dashboard</h1>
      <p className="text-gray-700 mt-2">Welcome Dr. {user?.name}</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-xl font-semibold">Today's Appointments</h2>
          <p className="text-gray-600">Check your scheduled appointments.</p>
        </div>

        <div className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-xl font-semibold">Patient Medical Records</h2>
          <p className="text-gray-600">Access medical history of patients.</p>
        </div>
      </div>
    </div>
  );
}
