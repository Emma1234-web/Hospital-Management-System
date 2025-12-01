import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-4xl font-bold mb-6 text-blue-600">Welcome to Hospital Management System</h1>
      <p className="text-lg mb-4 text-gray-700 text-center">
        Manage doctors, patients, and appointments seamlessly.
      </p>

      <div className="flex space-x-4">
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          Register
        </button>
      </div>
    </div>
  );
}
