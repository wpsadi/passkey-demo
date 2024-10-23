import { getAccountFromCookie } from "./cookies";
import { getAccountFromId } from "./getAccountFromId";

export const makeSureAccountExistFromCookie = async () => {
  try {
    const accountStatus = await getAccountFromCookie();
    if (!accountStatus.success) {
      return {
        success: false,
        msg: accountStatus.msg,
      };
    }
     // there is some id passed by the cookie
    const userId = accountStatus.userId as string;

    // making sure account exist
    const accountExistenceStatus = await getAccountFromId(userId);

    if (!accountExistenceStatus.success) {
      return {
        success: false,
        msg: accountExistenceStatus.msg,
      };
    }

    return {
      success: true,
      account: accountExistenceStatus.account,
      msg: "Account found"
    }
   

  } catch {
    return {
      success: false,
      msg: "Failed to get account from cookie",
    };
  }
};
