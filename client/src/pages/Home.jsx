export default function Home() {
  return (
    <div className="min-h-screen bg-white px-6">
      <div className="text-center mt-12 mb-10">
        <h1 className="text-4xl font-bold text-gray-800">
          Hospital Management System
        </h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="bg-blue-100 p-8 rounded-2xl shadow text-center">
          <h2 className="font-semibold text-xl mb-2">Patients</h2>
          <p>Manage patient details, history & appointments.</p>
        </div>

        <div className="bg-blue-100 p-8 rounded-2xl shadow text-center">
          <h2 className="font-semibold text-xl mb-2">Doctors</h2>
          <p>View and manage doctors in the hospital.</p>
        </div>

        <div className="bg-blue-100 p-8 rounded-2xl shadow text-center">
          <h2 className="font-semibold text-xl mb-2">Appointments</h2>
          <p>Schedule and track appointments easily.</p>
        </div>
      </div>
    </div>
  );
}
