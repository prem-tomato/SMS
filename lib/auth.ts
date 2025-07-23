"use client";

export const saveAccessToken = (token: string) => {
  localStorage.setItem("access_token", token);
};

export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

export const removeAccessToken = () => {
  localStorage.removeItem("access_token");
};

export const saveUserRole = (role: string) => {
  localStorage.setItem("role", role);
};

export const getUserRole = () => {
  return localStorage.getItem("role");
};

export const saveSocietyId = (societyId: string) => {
  localStorage.setItem("society_id", societyId);
};

export const getSocietyIdFromLocalStorage = () => {
  return localStorage.getItem("society_id");
};