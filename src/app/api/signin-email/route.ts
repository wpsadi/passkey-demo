import { addSessionCookie } from "@/helpers/cookies";
import { comparePassword } from "@/helpers/passwordEncryption";
import { db, userCollection } from "@/models/name";
import { database } from "@/models/server/config";
import { emailSchema } from "@/validators/emailValidators";
import { passwordSchema } from "@/validators/passwordValidators";
import { NextRequest, NextResponse } from "next/server";
import {  Query } from "node-appwrite";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.formData();
    let email = body.get("email") as string;
    let password = body.get("password") as string;
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          msg: "Email and password are required",
        },
        {
          status: 400,
        }
      );
    }
    // validations
    const isEmail = emailSchema.safeParse(email);
    if (!isEmail.success) {
      return NextResponse.json(
        {
          success: false,
          msg: isEmail.error.errors[0].message || "Invalid email",
        },
        {
          status: 400,
        }
      );
    }

    email = isEmail.data;

    // password validation
    const isPassword = passwordSchema.safeParse(password);
    if (!isPassword.success) {
      return NextResponse.json(
        {
          success: false,
          msg: isPassword.error.errors[0].message || "Invalid password",
        },
        {
          status: 400,
        }
      );
    }

    password = isPassword.data;

    // sign in logic
    const userAccountList = await database.listDocuments(db, userCollection, [
      Query.limit(1),
      Query.select(["$id", "email", "password"]),
      Query.equal("email", email),
    ]);
    if (userAccountList.total !== 1){
        return NextResponse.json(
            {
                success:false,
                msg:"Invalid email/password"
            },
            {
                status:400
            }
        )
    }

    const userAccount = userAccountList.documents[0];

    const encryptedHash = userAccount!.password as string;

    // compare password
    const isPasswordMatch = await comparePassword(password, encryptedHash);

    if (!isPasswordMatch.success) {
      return NextResponse.json(
        {
          success: false,
          msg: "Unable to check password match",
        },
        {
          status: 500,
        }
      );
    }

    if (!isPasswordMatch.isMatch) {
      return NextResponse.json(
        {
          success: false,
          msg: "Invalid email/password",
        },
        {
          status: 400,
        }
      );
    }

    // password is a match
    const user = userAccount;

    // create session cookie
    const cookieStatus = await addSessionCookie(user.$id);

    if (!cookieStatus.success) {
      return NextResponse.json({
        success: false,
        msg: cookieStatus.msg,
      },{
            status:500
      });
    }

    return NextResponse.json(
      {
        success: true,
        msg: "Signed in successfully",
      }
    );





  } catch {
    return NextResponse.json(
      {
        success: false,
        msg: "Failed to sign in via email/password",
      },
      {
        status: 400,
      }
    );
  }
};
