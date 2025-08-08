import { AddRazorPayConfig } from "@/app/api/socities/socities.types";
import { getAccessToken, getSocietyIdFromLocalStorage } from "@/lib/auth";

export const getRazorPayConfigService = async () => {
  try {
    const token = await getAccessToken();
    const societyId = await getSocietyIdFromLocalStorage();
    const response = await fetch(
      `api/socities/${societyId}/razorpay-config/list`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error in getRazorPayConfigService: ${error}`);
  }
};

export const addRazorPayConfigService = async (
  razorPayConfig: AddRazorPayConfig
): Promise<void> => {
  try {
    const societyId = await getSocietyIdFromLocalStorage();
    const token = await getAccessToken();

    const response = await fetch(`api/socities/${societyId}/razorpay-config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(razorPayConfig),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error in addRazorPayConfigService: ${error}`);
  }
};
