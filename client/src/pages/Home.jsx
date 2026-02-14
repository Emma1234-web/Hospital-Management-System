import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="surface p-8 md:p-10">
        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div className="space-y-4">
            <h1 className="page-title">Hospital Management System</h1>
            <p className="page-subtitle">
              One workspace for appointments, billing, prescriptions, lab results, and care coordination.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/appointments" className="btn-primary">
                View Appointments
              </Link>
              <Link to="/patients" className="btn-secondary">
                Manage Patients
              </Link>
            </div>
          </div>
          <div className="surface-soft p-6">
            <div className="grid gap-4">
              <div className="stat-card">
                <div className="stat-label">Operations</div>
                <div className="stat-value">Streamlined</div>
                <div className="text-sm text-gray-600">
                  Clear workflows for admins, doctors, and patients.
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Visibility</div>
                <div className="stat-value">Realtime</div>
                <div className="text-sm text-gray-600">
                  Track status across every clinical and billing step.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="page-header">
          <h2 className="page-title text-2xl">Core Modules</h2>
          <p className="page-subtitle">Jump straight into the areas you manage daily.</p>
        </div>
        <div className="card-grid">
          <Link to="/patients" className="card">
            <div className="stat-label">Patients</div>
            <div className="stat-value">Records</div>
            <p className="text-sm text-gray-600 mt-2">
              Demographics, contact, and history in one place.
            </p>
          </Link>
          <Link to="/doctors" className="card">
            <div className="stat-label">Doctors</div>
            <div className="stat-value">Staffing</div>
            <p className="text-sm text-gray-600 mt-2">
              Manage schedules, availability, and profiles.
            </p>
          </Link>
          <Link to="/appointments" className="card">
            <div className="stat-label">Appointments</div>
            <div className="stat-value">Scheduling</div>
            <p className="text-sm text-gray-600 mt-2">
              Review status, reschedule, and manage flow.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
