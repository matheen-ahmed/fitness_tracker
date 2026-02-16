import { createContext, useContext, useEffect, useState } from "react";
// import { type ActivityEntry, type FoodEntry, initialState, type User } from "../types";
import {
  type ActivityEntry,
  type FoodEntry,
  initialState,
  type User,
  type Credentials
} from "../types";

import { useNavigate } from "react-router-dom";
import api from "../configs/api";
import toast from "react-hot-toast";

const AppContext = createContext(initialState);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [isUserFetched, setIsUserFetched] = useState(
    localStorage.getItem("token") ? false : true
  );
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [allFoodLogs, setAllFoodLogs] = useState<FoodEntry[]>([]);
const [allActivityLogs, setAllActivityLogs] = useState<ActivityEntry[]>([]);


  // ✅ SIGNUP
  const signup = async (credentials: Credentials) => {
    try {
      const { data } = await api.post(
        "/api/auth/local/register",
        credentials
      );

      setUser({ ...data.user, token: data.jwt });

      if (data?.user?.age && data?.user?.weight && data?.user?.goal) {
        setOnboardingCompleted(true);
      }

      localStorage.setItem("token", data.jwt);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.jwt}`;
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.error?.message || error?.message
      );
    }
  };

  // ✅ LOGIN
  const login = async (credentials: Credentials) => {
    try {
      const { data } = await api.post("/api/auth/local", {
        identifier: credentials.email,
        password: credentials.password,
      });

      setUser({ ...data.user, token: data.jwt });

      if (data?.user?.age && data?.user?.weight && data?.user?.goal) {
        setOnboardingCompleted(true);
      }

      localStorage.setItem("token", data.jwt);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.jwt}`;
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.error?.message || error?.message
      );
    }
  };

  // ✅ FETCH USER
  const fetchUser = async (token: string) => {
    try {
      const { data } = await api.get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser({ ...data, token });

      if (data?.age && data?.weight && data?.goal) {
        setOnboardingCompleted(true);
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.error?.message || error?.message
      );
    }

    setIsUserFetched(true);
  };

  // ✅ FETCH FOOD LOGS
const fetchFoodLogs = async (token: string) => {
  try {
    const { data } = await api.get("/api/food-logs", {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 🔥 Handle both Strapi formats
    const logsArray = Array.isArray(data)
      ? data
      : data?.data ?? [];

    const formattedLogs = logsArray.map((item: any) => ({
      documentId: item.id ?? item.documentId,
      ...(item.attributes ?? item),
    }));
console.log("FOOD LOG RESPONSE:", data);

    setAllFoodLogs(formattedLogs);
 
  } catch (error: any) {
    console.log(error);
  }
};



  // ✅ FETCH ACTIVITY LOGS
  const fetchActivityLogs = async (token: string) => {
    try {
      const { data } = await api.get("/api/activity-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAllActivityLogs(data.data); // Strapi returns { data: [...] }
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.error?.message || error?.message
      );
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setOnboardingCompleted(false);
    api.defaults.headers.common["Authorization"] = "";
    navigate("/");
  };

  // ✅ INIT LOAD
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      (async () => {
        await fetchUser(token);
        await fetchFoodLogs(token);
        await fetchActivityLogs(token);
      })();
    }
  }, []);

  const value = {
    user,
    setUser,
    isUserFetched,
    fetchUser,
    signup,
    login,
    logout,
    onboardingCompleted,
    setOnboardingCompleted,
    allFoodLogs,
    allActivityLogs,
    setAllFoodLogs,
    setAllActivityLogs,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
