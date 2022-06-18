import { useState, useCallback, useEffect } from "react";

let logoutTimer;

export const useAuth = () => {
  const [token, setToken] = useState(null);
  const [tokenExpirationDate, setTokenExpirationDate] = useState(null);
  const [userID, setUserID] = useState(null);

  const login = useCallback((uid, token, expiration) => {
    setToken(token);
    setUserID(uid);

    const expirationDate = expiration || new Date(new Date().getTime() + 1000 * 3600);
    setTokenExpirationDate(expirationDate);

    localStorage.setItem("userData", JSON.stringify(
      {
        userID: uid,
        token,
        expiration: expirationDate.toISOString()
      }
    ));
  }, []);
  
  const logout = useCallback(() => {
    setToken(null);
    setUserID(null);
    setTokenExpirationDate(null);
    localStorage.removeItem("userData");
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      logoutTimer = setTimeout(logout, tokenExpirationDate.getTime() - new Date().getTime())
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    
    if (storedData && storedData.token && new Date(storedData.expiration) > new Date()) {
      login(storedData.userID, storedData.token, new Date(storedData.expiration));
    }
  }, [login]);

  return { token, login, logout, userID };
}