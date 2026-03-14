import axiosInstance from "@/src/libs/axios";

export class AwardsService {
  static getAll = () => {
    return axiosInstance.get("/awards").then((res) => res.data);
  };

  static getUserBadges = (userId: string) => {
    return axiosInstance
      .get(`/awards/user?userId=${userId}`)
      .then((res) => res.data);
  };
}
