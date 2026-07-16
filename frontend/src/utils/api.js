import axios from "axios";

const envUrl = import.meta.env.VITE_SERVER_URL;
let serverUrl;
if (envUrl) {
  serverUrl = envUrl;
} else {
  const apiHostname = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'localhost'
    : window.location.hostname;
  serverUrl = `http://${apiHostname}:5000`;
}

const api = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to automatically attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const userInfoStr = localStorage.getItem("userInfo");
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        if (userInfo && userInfo.token) {
          if (config.headers && typeof config.headers.set === 'function') {
            config.headers.set('Authorization', `Bearer ${userInfo.token}`);
          } else {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${userInfo.token}`;
          }
        }
      } catch (error) {
        console.error("Error parsing userInfo from localStorage:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
