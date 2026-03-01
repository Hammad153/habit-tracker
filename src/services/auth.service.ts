import axiosInstance from "../libs/axios";

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  signup: async (data: any) => {
    const response = await axiosInstance.post("/auth/signup", data);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get("/auth/profile");
    return response.data;
  },

  changePassword: async (data: any) => {
    const response = await axiosInstance.post("/profile/change-password", data);
    return response.data;
  },
};
