import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token && token !== "undefined" && token !== "null") {
    req.headers.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
  }
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const message = error?.response?.data?.message;
    if (status === 401 && (message === "Token invalid" || message === "Not authorized")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
