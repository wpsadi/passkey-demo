import { db, userCollection } from "@/models/name";
import { database } from "@/models/server/config";
import { cookies } from "next/headers";
import { Query } from "node-appwrite";
import { CreateSessionToken, VerifySessionToken } from "./SessionToken";

export const addSessionCookie = async (userId: string) => {
  try {
    const cookieStore = await cookies();

    // verifying the userId
    const users = await database.listDocuments(db, userCollection, [
      Query.limit(1),
      Query.select(["$id"]),
      Query.equal("$id", userId),
    ]);

    if (users.total !== 1) {
      return {
        success: false,
        msg: "Invalid user ID",
      };
    }

    // creating a session cookie
    const token = await CreateSessionToken(users.documents[0].$id);
    if (!token.success) {
      return {
        success: false,
        msg: "Failed to create session cookie - token not created",
      };
    }

    if (token.token) {
      console.log(token.token);
      cookieStore.set({
        name: "session",
        value: token.token,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return {
        success: true,
        msg: "Session cookie created",
      };
    } else {
      return {
        success: false,
        msg: "Failed to create session cookie - token not created",
      };
    }
  } catch {
    return {
      success: false,
      msg: "Failed to create session cookie - some internal error",
    };
  }
};

export const removeSessionCookie = async () => {
  
  try {
    const cookieStore = await cookies();
    (cookieStore).set({
      name: "session",
      value: "",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 0,
      expires: new Date(0),
    });
    return {
      success: true,
      msg: "Session cookie removed",
    };
  } catch {
    return {
      success: false,
      msg: "Failed to remove session cookie",
    };
  }
};

export const getSessionCookie = async () => {
 
  try {
    const cookieStore = await cookies();
    const session = (cookieStore).has("session");
    if (session) {
      return {
        success: true,
        msg: "Session cookie found",
        session: (cookieStore).get("session"),
      };
    } else {
      return {
        success: false,
        msg: "Session cookie not found",
      };
    }
  } catch {
    return {
      success: false,
      msg: "Failed to get session cookie",
    };
  }
};

export const getAccountFromCookie = async () => {
  try {
    const sessionRequest = await getSessionCookie();
    if (!sessionRequest.success) {
      return {
        success: false,
        msg: "Session cookie not found",
      };
    }

    const session = sessionRequest.session;
    if (!session) {
      return {
        success: false,
        msg: "Session cookie not found",
      };
    }

    const token = session.value;
    if (!token) {
      return {
        success: false,
        msg: "Session cookie not found",
      };
    }

    // verifying the session token
    let validToken = false;
    let tokenData = null;
    const tokenStatus = await VerifySessionToken(token)

    if (tokenStatus.success) {
      validToken = true;
      tokenData = tokenStatus.payload as {
        userId: string;
      };
    }
      

    if (!validToken) {
      return {
        success: false,
        msg: "Invalid session token",
      };
    }

    const userId = tokenData!.userId;
    if (!userId) {
      return {
        success: false,
        msg: "Invalid session token",
      };
    }

    return {
      success: true,
      msg: "Account found",
      userId: userId,
    };
  } catch {
    return {
      success: false,
      msg: "Failed to get account from cookie",
    };
  }
};
