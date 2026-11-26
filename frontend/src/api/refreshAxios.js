import axios from "axios";

const refreshAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1/",
  withCredentials: true,
  timeout: 5000,
});

export default refreshAxios;