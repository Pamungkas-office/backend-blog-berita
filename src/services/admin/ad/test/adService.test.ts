import * as adService from "../adService";
import { CustomError } from "../../../../lib/custom-error";
import { db } from "../../../../lib/db/db";

const mockReturnValues: any[] = [];

jest.mock("../../../../lib/db/db", () => {
  const mockDb: any = {
    select: jest.fn(() => mockDb),
    from: jest.fn(() => mockDb),
    where: jest.fn(() => mockDb),
    limit: jest.fn(() => mockDb),
    insert: jest.fn(() => mockDb),
    values: jest.fn(() => mockDb),
    returning: jest.fn(() => mockDb),
    update: jest.fn(() => mockDb),
    set: jest.fn(() => mockDb),
    delete: jest.fn(() => mockDb),
    orderBy: jest.fn(() => mockDb),
    then: (resolve: any) => resolve(mockReturnValues.shift() ?? []),
  };
  return { db: mockDb };
});

describe("SERVICE: adService", () => {
  beforeEach(() => {
    mockReturnValues.length = 0;
    jest.clearAllMocks();
  });

  describe("serviceGetAllAds", () => {
    it("SUCCESS: should return all ad positions", async () => {
      const mockAds = [
        { id: 1, position: "header", ad_code: "<ad>", is_active: true },
        { id: 2, position: "sidebar", ad_code: "<ad2>", is_active: false },
      ];
      mockReturnValues.push(mockAds);

      const result = await adService.serviceGetAllAds();
      expect(result).toEqual(mockAds);
      expect(db.orderBy).toHaveBeenCalled();
    });

    it("SUCCESS: should return empty array when no ads exist", async () => {
      mockReturnValues.push([]);

      const result = await adService.serviceGetAllAds();
      expect(result).toEqual([]);
    });
  });

  describe("serviceGetAdById", () => {
    it("SUCCESS: should return ad when found", async () => {
      const mockAd = { id: 1, position: "header", ad_code: "<ad>", is_active: true };
      mockReturnValues.push([mockAd]);

      const result = await adService.serviceGetAdById(1);
      expect(result).toEqual(mockAd);
    });

    it("SUCCESS: should return undefined when not found", async () => {
      mockReturnValues.push([]);

      const result = await adService.serviceGetAdById(999);
      expect(result).toBeUndefined();
    });
  });

  describe("serviceCreateAd", () => {
    it("SUCCESS: should create and return ad when position is unique", async () => {
      const mockAd = { id: 1, position: "header", ad_code: "<script>", is_active: true };
      mockReturnValues.push([]);
      mockReturnValues.push([mockAd]);

      const result = await adService.serviceCreateAd("header", "<script>", true);
      expect(result).toEqual(mockAd);
      expect(db.values).toHaveBeenCalledWith({ position: "header", ad_code: "<script>", is_active: true });
    });

    it("ERROR: should throw 409 when position already exists", async () => {
      mockReturnValues.push([{ id: 1, position: "header" }]);

      await expect(adService.serviceCreateAd("header", "<ad>", true))
        .rejects
        .toThrow(new CustomError('Posisi "header" sudah memiliki kode iklan. Edit yang sudah ada atau hapus terlebih dahulu.', 409));
    });
  });

  describe("serviceUpdateAd", () => {
    it("SUCCESS: should update and return ad when id exists", async () => {
      const mockUpdated = { id: 1, position: "header", ad_code: "<new>", is_active: false };
      mockReturnValues.push([{ id: 1 }]);
      mockReturnValues.push([mockUpdated]);

      const result = await adService.serviceUpdateAd(1, { ad_code: "<new>", is_active: false });
      expect(result).toEqual(mockUpdated);
      expect(db.set).toHaveBeenCalledWith({ ad_code: "<new>", is_active: false });
    });

    it("ERROR: should throw 404 when ad does not exist", async () => {
      mockReturnValues.push([]);

      await expect(adService.serviceUpdateAd(999, { ad_code: "<ad>", is_active: true }))
        .rejects
        .toThrow(new CustomError("Iklan tidak ditemukan", 404));

      expect(db.update).not.toHaveBeenCalled();
    });
  });

  describe("serviceDeleteAd", () => {
    it("SUCCESS: should delete ad when id exists", async () => {
      mockReturnValues.push([{ id: 1 }]);

      await adService.serviceDeleteAd(1);
      expect(db.delete).toHaveBeenCalled();
    });

    it("ERROR: should throw 404 when ad does not exist", async () => {
      mockReturnValues.push([]);

      await expect(adService.serviceDeleteAd(999))
        .rejects
        .toThrow(new CustomError("Iklan tidak ditemukan", 404));

      expect(db.delete).not.toHaveBeenCalled();
    });
  });

  describe("serviceGetActiveAdByPosition", () => {
    it("SUCCESS: should return active ad for position", async () => {
      const mockAd = { id: 1, position: "header", is_active: true };
      mockReturnValues.push([mockAd]);

      const result = await adService.serviceGetActiveAdByPosition("header");
      expect(result).toEqual(mockAd);
      expect(db.where).toHaveBeenCalled();
    });

    it("SUCCESS: should return undefined when no active ad found", async () => {
      mockReturnValues.push([]);

      const result = await adService.serviceGetActiveAdByPosition("footer");
      expect(result).toBeUndefined();
    });
  });
});
