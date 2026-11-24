import axios from "axios";
import { tokenStore } from "./tokenStore";
import refreshAxios from "./refreshAxios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1/",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = tokenStore.get();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    try {
        const response = await refreshAxios.post('/auth/refresh');

        const newAccessToken = response.data.accessToken

        tokenStore.set(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        return api(originalRequest)

    }catch(refreshError){
        tokenStore(null)
        return Promise.reject(refreshError)
    }
    return Promise.reject(error);
  },
);

export default api
