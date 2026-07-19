import axiosInstance from "@/src/libs/axios";

export class AuthService {
  static login = (email: string, password: string) => {
    return axiosInstance
      .post("/auth/login", { email, password })
      .then((res) => res.data);
  };

  static signup = (data: { name: string; email: string; password: string }) => {
    return axiosInstance.post("/auth/signup", data).then((res) => res.data);
  };

  static logout = () => {
    return axiosInstance.post("/auth/logout").then((res) => res.data);
  };

  static getProfile = () => {
    return axiosInstance.get("/auth/profile").then((res) => res.data);
  };

  static deleteAccount = () => {
    return axiosInstance.delete("/users/me").then((res) => res.data);
  };

  static forgotPassword = (email: string) => {
    return axiosInstance
      .post("/auth/forgot-password", { email })
      .then((res) => res.data);
  };
}
