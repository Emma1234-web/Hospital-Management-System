import useAuth from "../hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold">Profile</h2>
      <div className="mt-4 space-y-2">
        <div><strong>Name:</strong> {user?.name}</div>
        <div><strong>Email:</strong> {user?.email}</div>
        <div><strong>Role:</strong> {user?.role}</div>
      </div>
    </div>
  );
}
