import axiosInstance from "@/src/libs/axios";

export class ProfileService {
  static get = (userId: string) => {
    return axiosInstance
      .get(`/profile?userId=${userId}`)
      .then((res) => res.data);
  };

  static update = (id: string, data: any) => {
    return axiosInstance.patch(`/profile/${id}`, data).then((res) => res.data);
  };

  static changePassword = (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    return axiosInstance
      .post("/profile/change-password", data)
      .then((res) => res.data);
  };
}
