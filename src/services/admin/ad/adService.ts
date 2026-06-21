import { eq, and } from "drizzle-orm";
import { db } from "../../../lib/db/db.js";
import { ad_positions } from "../../../lib/db/schema.js";
import { CustomError } from "../../../lib/custom-error.js";

export const serviceGetAllAds = async () => {
  return await db.select().from(ad_positions).orderBy(ad_positions.id);
};

export const serviceGetAdById = async (id: number) => {
  const [ad] = await db
    .select()
    .from(ad_positions)
    .where(eq(ad_positions.id, id))
    .limit(1);
  return ad;
};

export const serviceCreateAd = async (position: string, ad_code: string, is_active: boolean) => {
  const [existing] = await db
    .select()
    .from(ad_positions)
    .where(eq(ad_positions.position, position as any))
    .limit(1);

  if (existing) {
    throw new CustomError(`Posisi "${position}" sudah memiliki kode iklan. Edit yang sudah ada atau hapus terlebih dahulu.`, 409);
  }

  const [ad] = await db
    .insert(ad_positions)
    .values({ position: position as any, ad_code, is_active })
    .returning();
  return ad;
};

export const serviceUpdateAd = async (id: number, data: { ad_code: string; is_active: boolean }) => {
  const [existing] = await db
    .select()
    .from(ad_positions)
    .where(eq(ad_positions.id, id))
    .limit(1);

  if (!existing) {
    throw new CustomError("Iklan tidak ditemukan", 404);
  }

  const [updated] = await db
    .update(ad_positions)
    .set({ ad_code: data.ad_code, is_active: data.is_active })
    .where(eq(ad_positions.id, id))
    .returning();
  return updated;
};

export const serviceDeleteAd = async (id: number) => {
  const [existing] = await db
    .select()
    .from(ad_positions)
    .where(eq(ad_positions.id, id))
    .limit(1);

  if (!existing) {
    throw new CustomError("Iklan tidak ditemukan", 404);
  }

  await db.delete(ad_positions).where(eq(ad_positions.id, id));
};

export const serviceGetActiveAdByPosition = async (position: string) => {
  const [ad] = await db
    .select()
    .from(ad_positions)
    .where(
      and(
        eq(ad_positions.position, position as any),
        eq(ad_positions.is_active, true),
      ),
    )
    .limit(1);
  return ad;
};
