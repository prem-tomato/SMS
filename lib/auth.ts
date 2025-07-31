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

export const removeUserRole = () => {
  localStorage.removeItem("role");
};

export const saveSocietyId = (societyId: string) => {
  localStorage.setItem("society_id", societyId);
};

export const getSocietyIdFromLocalStorage = () => {
  return localStorage.getItem("society_id");
};

export const removeSocietyId = () => {
  localStorage.removeItem("society_id");
};

export const saveSocietyType = (societyType: string | undefined) => {
  if (societyType) {
    localStorage.setItem("society_type", societyType);
  }
};

export const getSocietyTypeFromLocalStorage = () => {
  return localStorage.getItem("society_type");
};

export const removeSocietyType = () => {
  localStorage.removeItem("society_type");
};
