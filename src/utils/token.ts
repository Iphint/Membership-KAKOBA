export const getToken = (): string | null => {
  return localStorage.getItem('token_key');
};

export const setToken = (token: string): void => {
    return localStorage.setItem('token_key', token);
}

export const removeToken = (): void => {
    return localStorage.removeItem('token_key');
}

export const isAuthenticated = (): boolean => {
    const token = getToken();
    return !!token;
}
