import axiosInstance from "@/src/libs/axios";

const query = (params: Record<string, string | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const value = search.toString();
  return value ? `?${value}` : "";
};

export class BudgetService {
  static summary = (startDate?: string, endDate?: string) =>
    axiosInstance
      .get(`/budget/summary${query({ startDate, endDate })}`)
      .then((res) => res.data);

  static budgets = (startDate?: string, endDate?: string) =>
    axiosInstance
      .get(`/budget${query({ startDate, endDate })}`)
      .then((res) => res.data);

  static createBudget = (data: any) =>
    axiosInstance.post("/budget", data).then((res) => res.data);

  static updateBudget = (id: string, data: any) =>
    axiosInstance.patch(`/budget/${id}`, data).then((res) => res.data);

  static deleteBudget = (id: string) =>
    axiosInstance.delete(`/budget/${id}`).then((res) => res.data);

  static categories = () =>
    axiosInstance.get("/budget/categories").then((res) => res.data);

  static createCategory = (data: any) =>
    axiosInstance.post("/budget/categories", data).then((res) => res.data);

  static expenses = (startDate?: string, endDate?: string) =>
    axiosInstance
      .get(`/budget/expenses${query({ startDate, endDate })}`)
      .then((res) => res.data);

  static createExpense = (data: any) =>
    axiosInstance.post("/budget/expenses", data).then((res) => res.data);

  static updateExpense = (id: string, data: any) =>
    axiosInstance.patch(`/budget/expenses/${id}`, data).then((res) => res.data);

  static deleteExpense = (id: string) =>
    axiosInstance.delete(`/budget/expenses/${id}`).then((res) => res.data);

  static incomes = (startDate?: string, endDate?: string) =>
    axiosInstance
      .get(`/budget/income${query({ startDate, endDate })}`)
      .then((res) => res.data);

  static createIncome = (data: any) =>
    axiosInstance.post("/budget/income", data).then((res) => res.data);

  static updateIncome = (id: string, data: any) =>
    axiosInstance.patch(`/budget/income/${id}`, data).then((res) => res.data);

  static deleteIncome = (id: string) =>
    axiosInstance.delete(`/budget/income/${id}`).then((res) => res.data);
}
