import useAuth from "../hooks/useAuth";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-2">Welcome {user?.name}</p>
    </div>
  );
}
