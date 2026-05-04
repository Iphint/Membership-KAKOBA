import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface LoginPayload {
  email: string;
  password: string;
}

export const loginRequest = async (payload: LoginPayload) => {
  try {
    const res = await axios.post(`${API_URL}/api/login`, payload);
    console.log("LOGIN SUCCESS:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("LOGIN ERROR:", err.response?.data || err.message);
    throw err;
  }
};