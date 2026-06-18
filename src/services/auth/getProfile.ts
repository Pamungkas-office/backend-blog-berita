import { serviceGetMe } from "./getMe.ts";

export const serviceGetProfile = async (userId: string) => {
  return serviceGetMe(userId);
};