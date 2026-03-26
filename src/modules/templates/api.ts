import axiosInstance from "@/src/libs/axios";

export class TemplateApiService {
  static getAll = () => {
    return axiosInstance.get("/template").then((res) => res.data);
  };

  static getCategories = () => {
    return axiosInstance.get("/template/categories").then((res) => res.data);
  };

  static getById = (id: string) => {
    return axiosInstance.get(`/template/${id}`).then((res) => res.data);
  };
}
