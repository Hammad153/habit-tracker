import axiosInstance from "@/src/libs/axios";

export class AwardsService {
  static getAll = () => {
    return axiosInstance.get("/awards").then((res) => res.data);
  };

  static getUserBadges = (userId: string = "default-user") => {
    return axiosInstance
      .get(`/awards/user?userId=${userId}`)
      .then((res) => res.data);
  };
}
