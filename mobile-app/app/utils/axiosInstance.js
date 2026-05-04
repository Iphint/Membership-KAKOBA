import axios from "axios";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const setAxiosAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

export default axiosInstance;
