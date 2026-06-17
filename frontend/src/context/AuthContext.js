// src/context/AuthContext.js

import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
} from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        dispatch({ type: "SET_LOADING", payload: false });
        return;
      }
      try {
        const { data } = await authAPI.getMe();
        dispatch({ type: "LOGIN_SUCCESS", payload: data.user });
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    dispatch({ type: "SET_LOADING", payload: true });
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    dispatch({ type: "LOGIN_SUCCESS", payload: data.user });
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    dispatch({ type: "SET_LOADING", payload: true });
    const { data } = await authAPI.register(userData);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    dispatch({ type: "LOGIN_SUCCESS", payload: data.user });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (_) {}
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch({ type: "LOGOUT" });
  }, []);

  const updateUser = useCallback((updates) => {
    dispatch({ type: "UPDATE_USER", payload: updates });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
