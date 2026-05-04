import { getToken } from "./token";

export const authHeader = () => {
    const token = getToken();
    return {
        Authorization: token ? `Bearer ${token}` : "",
    };
};