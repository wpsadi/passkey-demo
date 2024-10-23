import { addSessionCookie } from "@/helpers/cookies";
import { comparePassword } from "@/helpers/passwordEncryption";
import { db, userCollection } from "@/models/name";
import { database } from "@/models/server/config";
import { passwordSchema } from "@/validators/passwordValidators";
import { usernameSchema } from "@/validators/usernameValidator";
import { NextRequest, NextResponse } from "next/server"
import { Query } from "node-appwrite";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.formData();
        let password = body.get("password") as string;
        let username = body.get("username") as string;
        if (!password || !username) {
          return NextResponse.json({
            success: false,
            msg: "Username and password are required",
          },{
            status:400
          });
        }

         // password validation
    const isPassword = passwordSchema.safeParse(password);
    if (!isPassword.success) {
      return NextResponse.json({
        success: false,
        msg: isPassword.error.errors[0].message || "Invalid password",
      },{
        status:400
      });
    }

    password = isPassword.data;

    // username
    const isUsername = usernameSchema.safeParse(username);
    if (!isUsername.success) {
      return NextResponse.json({
        success: false,
        msg: isUsername.error.errors[0].message || "Invalid username",
      },{
        status:400
      });
    }

    username = isUsername.data;

    // sign in logic
    const userAccountList = await database.listDocuments(db, userCollection, [
        Query.limit(1),
        Query.select(["$id", "email", "password"]),
        Query.equal("username", username),
      ]);
      if (userAccountList.total !== 1){
          return NextResponse.json(
              {
                  success:false,
                  msg:"Invalid username/password"
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
            msg: "Invalid username/password",
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



    }catch{
        return NextResponse.json({
            success:false,
            msg:"Failed to sign in via email/password"
        },{
            status:400
        })
    }
}