import useAuth from "../hooks/useAuth";
import AdminBilling from "./AdminBilling";
import PatientBilling from "./PatientBilling";

export default function Billing() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "admin") return <AdminBilling />;
  if (user.role === "patient") return <PatientBilling />;

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold">Billing</h1>
      <p className="mt-2">Access denied.</p>
    </div>
  );
}
