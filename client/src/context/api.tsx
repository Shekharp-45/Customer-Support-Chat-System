import axios from "axios";


const API = axios.create({ baseURL: "http://localhost:5000/api" }); 

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});


export const login = (formData: { email: string; password: string }) =>
  API.post("/auth/login", formData);

export const register = (formData: { name: string; email: string; password: string }) =>
  API.post("/auth/register", formData);

