import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:5000/api", // change to your backend
});

// Add token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});
