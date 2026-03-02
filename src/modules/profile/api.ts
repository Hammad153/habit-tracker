import axiosInstance from "@/src/libs/axios";

export class ProfileService {
  static get = (userId: string = "default-user") => {
    return axiosInstance
      .get(`/profile?userId=${userId}`)
      .then((res) => res.data);
  };

  static update = (id: string, data: any) => {
    return axiosInstance.patch(`/profile/${id}`, data).then((res) => res.data);
  };
}
