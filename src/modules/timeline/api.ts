import axiosInstance from "@/src/libs/axios";

export class TimelineService {
  static get = (userId: string = "default-user") => {
    return axiosInstance
      .get(`/timeline?userId=${userId}`)
      .then((res) => res.data);
  };
}
