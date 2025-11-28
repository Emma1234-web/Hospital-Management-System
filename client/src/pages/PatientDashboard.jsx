export default function PatientDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-purple-700">Patient Dashboard</h1>
      <p className="text-gray-700 mt-2">Welcome {user?.name}</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-xl font-semibold">Book Appointment</h2>
          <p className="text-gray-600">Schedule a visit with a doctor.</p>
        </div>

        <div className="bg-white p-6 shadow rounded-xl">
          <h2 className="text-xl font-semibold">My Appointments</h2>
          <p className="text-gray-600">Track your upcoming sessions.</p>
        </div>
      </div>
    </div>
  );
}
