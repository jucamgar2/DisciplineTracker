import { createContext, useContext, useState , useEffect, useRef} from "react";

const AuthContext = createContext();

const REFRESH_MARGIN_MS = 60*1000;

function decodeJwtPayload(token){
  try{
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  }catch{
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("accessToken")
  );
  const [refreshToken, setRefreshToken] = useState(
    () => localStorage.getItem("refreshToken")
  );
  const [tokenIssuedAt, setTokenIssuedAt] = useState(() => {
    const stored = localStorage.getItem("tokenIssuedAt");
    return stored ? Number(stored) : null;
  });

  const refreshTimerRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  const saveTokens = (newAccess, newRefresh) => {
    const issuedAt = Date.now();
    localStorage.setItem("accessToken", newAccess);
    localStorage.setItem("refreshToken", newRefresh);
    localStorage.setItem("tokenIssuedAt", String(issuedAt));
    setAccessToken(newAccess);
    setRefreshToken(newRefresh);
    setTokenIssuedAt(issuedAt);
    isInitialLoadRef.current = false;
  };

  const clearTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenIssuedAt");
    setAccessToken(null);
    setRefreshToken(null);
    setTokenIssuedAt(null);
  };
  
  useEffect(() =>{
    if(!accessToken || !refreshToken) return;

    if(refreshTimerRef.current){
      clearTimeout(refreshTimerRef.current);
    }

    const payload = decodeJwtPayload(accessToken);
    if(!payload?.exp) return;

    const delay = payload.exp * 1000 - Date.now() - REFRESH_MARGIN_MS;

    const doRefresh = async () => {
      try{
        const response = await fetch(`${API_URL}/users/login/refresh`, {
          method: "POST",
          headers: {"Content-type": "application/json"},
          body: JSON.stringify({refreshToken}),
        });
        if(!response.ok){
          clearTokens();
          return;
        }
        const data = await response.json();
        saveTokens(data.accessToken, data.refreshToken);
      }catch{
        clearTokens();
      }
    };
    if(delay<=0){
      if(!isInitialLoadRef.current){
        doRefresh();
      }
      return;
    }

      isInitialLoadRef.current = false;
      refreshTimerRef.current = setTimeout(doRefresh, delay);
      
      return () => clearTimeout(refreshTimerRef.current);
  }, [accessToken, refreshToken]);

  const login = (newAccesToken, newRefreshToken) => {
    saveTokens(newAccesToken, newRefreshToken);
  };

  const logout = () => {
    if(refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    clearTokens();    
  };

  return (
    <AuthContext.Provider value={{ accessToken, refreshToken, tokenIssuedAt, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);