export default function Home() {
  return (
    <main className="bg-white min-h-screen px-4 sm:px-6 lg:px-10 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-center mb-10">
        Hospital Management System
      </h1>

      <section className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Patients */}
          <article className="bg-blue-50 p-6 rounded-2xl shadow-sm text-center">
            <div className="text-5xl mb-4">👤</div>
            <h3 className="text-xl font-semibold mb-2">Patients</h3>
            <p className="text-gray-600 text-sm">
              Manage patient records, appointments and medical details.
            </p>
          </article>

          {/* Doctors */}
          <article className="bg-blue-50 p-6 rounded-2xl shadow-sm text-center">
            <div className="text-5xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-semibold mb-2">Doctors</h3>
            <p className="text-gray-600 text-sm">
              View, add, and manage doctors and their specializations.
            </p>
          </article>

          {/* Appointments */}
          <article className="bg-blue-50 p-6 rounded-2xl shadow-sm text-center">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">Appointments</h3>
            <p className="text-gray-600 text-sm">
              Schedule, update, and monitor patient appointments.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
