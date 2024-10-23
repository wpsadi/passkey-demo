import { addSessionCookie } from "@/helpers/cookies";
import { ensureEmailNotUsed } from "@/helpers/ensureEmailNotUsed";
import { ensureUsernameNotTaken } from "@/helpers/EnsureUsernameNotTaken";
import { encryptPassword } from "@/helpers/passwordEncryption";
import { db, userCollection } from "@/models/name";
import { database } from "@/models/server/config";
import { emailSchema } from "@/validators/emailValidators";
import { passwordSchema } from "@/validators/passwordValidators";
import { usernameSchema } from "@/validators/usernameValidator";
import { NextRequest, NextResponse } from "next/server";
import { ID } from "node-appwrite";

export const POST = async (req: NextRequest) => {
  try {
    let email , password , username;
    // try{
    //     const body = await req.formData();
    //     email = body.get("email") as string;
    //     password = body.get("password") as string;
    //      username = body.get("username") as string;
    // }catch{
    //     //  {email,username,password} = await req.json();
   
    // }
    const rawBody  = await req.json();
    email = rawBody.email;
    password = rawBody.password;
    username = rawBody.username;
  
    if (!email || !password || !username) {
      return NextResponse.json({
        success: false,
        msg: "Email, Username and password are required",
      },{
        status:400
      });
    }

    // validations
    const isEmail = emailSchema.safeParse(email);
    if (!isEmail.success) {
      return NextResponse.json({
        success: false,
        msg: isEmail.error.errors[0].message || "Invalid email",
      },{
        status:400
      });
    }

    email = isEmail.data;

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

    // check if email already exists
    const emailCheck = await ensureEmailNotUsed(email);
    if (!emailCheck.success) {
      return NextResponse.json({
        success: false,
        msg: emailCheck.msg,
      },{
            status:500
      });
    }

    if (!emailCheck.unique) {
      return NextResponse.json({
        success: false,
        msg: emailCheck.msg,
      },{
            status:400
      });
    }

    // check  if username already exists
    const usernameCheck = await ensureUsernameNotTaken(username);
    if (!usernameCheck.success) {
      return NextResponse.json({
        success: false,
        msg: usernameCheck.msg,
      },{
            status:500
      });
    }

    if (!usernameCheck.unique) {
      return NextResponse.json({
        success: false,
        msg: usernameCheck.msg,
      },{
            status:400
      });
    }


    // now we are sure username,email are unique

    // encrypt password
    const passwordEncryption =  await encryptPassword(password);
    if (!passwordEncryption.success) {
      return NextResponse.json({
        success: false,
        msg: passwordEncryption.msg,
      },{
            status:500
      });
    }

    password = passwordEncryption!.encryptedPassword as string;

    // save user to db

    const user = await database.createDocument(
      db,
      userCollection,
      ID.unique(),
      {
        email,
        password,
        username,
      }
    );

    // account is created , so create a session cookie

    const cookieStatus = await addSessionCookie(user.$id);

    if (!cookieStatus.success) {
      return NextResponse.json({
        success: false,
        msg: cookieStatus.msg,
      },{
            status:500
      });
    }

    return NextResponse.json({
      success: true,
      user,
      msg: "Signup successful",
    },{
        status:201
    });
  } catch (e) {
    console.log(e);
    return NextResponse.json({
      success: false,
      msg: "An error occurred",
    },{
        status:500
    });
  }
};
