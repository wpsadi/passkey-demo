import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { makeSureAccountExistFromCookie } from "@/helpers/makeSureAccountExistFromCookie";
import {RegistrationResponseJSON} from "@simplewebauthn/types"
import { Models } from "node-appwrite";
import { gettingPasskeyFromId } from "@/helpers/gettingPasskeyById";
import { saveVerifiedPasskey } from "@/helpers/saveVerifiedPasskey";
import { env } from "@/env";
export const POST = async (req: NextRequest) => {
  try {
    const accountStatus = await makeSureAccountExistFromCookie();

    if (!accountStatus.success) {
      return NextResponse.json(
        {
          success: true,
          msg: accountStatus.msg,
        },
        {
          status: 400,
        }
      );
    }

    accountStatus.account as unknown as Models.Database & {
      email: string;
      username: string;
    };

    const body = await req.json();

    const passkeyId = body.passkeyId as string;

    if (!passkeyId) {
      return NextResponse.json(
        {
          success: false,
          msg: "PasskeyId is required",
        },
        {
          status: 400,
        }
      );
    }

    // make sure there is someOtherData in the body with "data" as RegistrationResponseJSON
    const data = body.data;

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          msg: "data is required",
        },
        {
          status: 400,
        }
      );
    }


    console.log(data)
    let parsedData;
    try{
        parsedData = JSON.parse(data) as RegistrationResponseJSON;
    }catch{
        return NextResponse.json({
            success:true,
            msg:"Invalid data"
        },{
            status:400
        })
    }
  
    const passkeyStatus = await gettingPasskeyFromId(passkeyId);

    if (!passkeyStatus.success) {
      return NextResponse.json(
        {
          success: false,
          msg: passkeyStatus.msg,
        },
        {
          status: 500,
        }
      );
    }



    if (passkeyStatus.passkey == null) {
      return NextResponse.json(
        {
          success: false,
          msg: "Invalid PasskeyId",
        },
        { status: 404 }
      );
    }


    const passkeyOptions = passkeyStatus.passkey;

    
    console.log("i am here",passkeyOptions)

    /**
     * A unique identifier for your website. 'localhost' is okay for
     * local dev
     */
    const rpID = env.passkey.rpID;
    /**
     * The URL at which registrations and authentications should occur.
     * 'http://localhost' and 'http://localhost:PORT' are also valid.
     * Do NOT include any trailing /
     */
    const origin = env.passkey.origin;

    console.log(parsedData)


    const verification = await verifyRegistrationResponse({
      response: parsedData,
      expectedChallenge: passkeyOptions.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

 

    console.log("i am here")
    const { verified } = verification;

    if (!verified) {
      return NextResponse.json(
        {
          success: false,
          msg: "Verification failed",
        },
        {
          status: 400,
        }
      );
    }

    // since the verification is successful, we can now update the passkey


    const savingKeyStatus = await saveVerifiedPasskey(accountStatus.account as unknown as Models.Database & {
        email: string;
        username: string;
      },verification,passkeyStatus.passkeyDBId as string)

    if (!savingKeyStatus.success) {
        return NextResponse.json(
            {
            success: false,
            msg: savingKeyStatus.msg,
            },
            {
            status: 500,
            }
        );
    }
   

    return NextResponse.json(
      {
        success: true,
        msg: "Verification successful",
      }
    );



    
  } catch(e) {
    console.log(e);
    return NextResponse.json(
      {
        success: false,
        msg: "Internal Error Occured",
      },
      {
        status: 500,
      }
    );
  }
};
