import axiosInstance from "@/src/libs/axios";
import { RewardsService } from "./api";
import { BundleStatus } from "./model";

jest.mock("@/src/libs/axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RewardsService", () => {
  it("fetches the coin balance from /reward/balance", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { coins: 320 } });
    await expect(RewardsService.getBalance()).resolves.toEqual({ coins: 320 });
    expect(mockedAxios.get).toHaveBeenCalledWith("/reward/balance");
  });

  it("fetches transactions", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    await RewardsService.listTransactions();
    expect(mockedAxios.get).toHaveBeenCalledWith("/reward/transactions");
  });

  it("posts freeze requests to the habit endpoint with the date", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { id: "f1", habitId: "h1", date: "2026-08-20", cost: 100 },
    });
    const result = await RewardsService.freezeDay("h1", "2026-08-20");
    expect(mockedAxios.post).toHaveBeenCalledWith("/habit/h1/freeze", {
      date: "2026-08-20",
    });
    expect(result?.cost).toBe(100);
  });

  it("lists shop items without params", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    await RewardsService.listShop();
    expect(mockedAxios.get).toHaveBeenCalledWith("/reward/shop");
  });

  it("redeems via /reward/shop/:id/redeem and returns remaining coins", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { redemption: { id: "r1", itemId: "i1" }, remainingCoins: 60 },
    });
    const result = await RewardsService.redeemItem("i1");
    expect(mockedAxios.post).toHaveBeenCalledWith("/reward/shop/i1/redeem");
    expect(result?.remainingCoins).toBe(60);
  });

  it("scopes bundle listing by habit when a habitId is given", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [] });
    await RewardsService.listBundles("h9");
    expect(mockedAxios.get).toHaveBeenCalledWith("/temptation-bundle", {
      params: { habitId: "h9" },
    });
  });

  it("uses a bundle through its dedicated endpoint", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { id: "b1", status: BundleStatus.USED, usedAt: "2026-08-22T00:00:00Z" },
    });
    await RewardsService.consumeBundle("b1");
    expect(mockedAxios.post).toHaveBeenCalledWith("/temptation-bundle/b1/use");
  });
});
