import { makeSureAccountExistFromCookie } from "@/helpers/makeSureAccountExistFromCookie";
import { NextResponse } from "next/server";
import {
  generateRegistrationOptions,
//   verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { getUserPasskeys } from "@/helpers/getUserPasskeys";
import { Models } from "node-appwrite";
import { savePasskey } from "@/helpers/savingPasskey";
import { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types";
export const POST = async () => {
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

    console.log(accountStatus);

    const account = accountStatus.account as unknown as (Models.Database & {
        email: string;
        username: string;
    });

    // gettng userPasskeys
    console.log(account);
    const passkeysStatus = await getUserPasskeys(account!.$id);

    if (!passkeysStatus.success) {
      return NextResponse.json(
        {
          success: false,
          msg: passkeysStatus.msg,
        },
        {
          status: 500,
        }
      );
    }
    const passkeys = passkeysStatus.passkeys as unknown as  {
       $id:string
        passkey:string
    }[];

    // passkey here

    /**
     * Human-readable title for your website
     */
    const rpName = "SimpleWebAuthn Example";
    /**
     * A unique identifier for your website. 'localhost' is okay for
     * local dev
     */
    const rpID = "localhost";
    /**
     * The URL at which registrations and authentications should occur.
     * 'http://localhost' and 'http://localhost:PORT' are also valid.
     * Do NOT include any trailing /
     */
    // const origin = `https://${rpID}`;

    const options: PublicKeyCredentialCreationOptionsJSON =
      await generateRegistrationOptions({
        rpName,
        rpID,
        userDisplayName: account.email,

        userName:account.$id,
        // Don't prompt users for additional information about the authenticator
        // (Recommended for smoother UX)
        attestationType: "none",
        // Prevent users from re-registering existing authenticators
        excludeCredentials: passkeys.map((passkey) => ({
          id: passkey.$id,
          // Optional
        //   transports: passkey.transports,
        })),
        // See "Guiding use of authenticators via authenticatorSelection" below
        authenticatorSelection: {
          // Defaults
          residentKey: "preferred",
          userVerification: "preferred",
          // Optional
          authenticatorAttachment: "platform",
        },
      });

    //   saving it in db
    const passkey = JSON.stringify(options);

    const savingStatus = await savePasskey(passkey, account.$id);

    if (!savingStatus.success) {
      return NextResponse.json(
        {
          success: false,
          msg: savingStatus.msg,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      msg: "Passkeys Challenge Created",
        options,
    });
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
