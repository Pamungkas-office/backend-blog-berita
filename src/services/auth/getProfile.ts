import { serviceGetMe } from "./getMe.js";

export const serviceGetProfile = async (userId: string) => {
  return serviceGetMe(userId);
};