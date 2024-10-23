import { db, passkeyCollection } from "@/models/name";
import { database } from "@/models/server/config";
import { VerifiedRegistrationResponse } from "@simplewebauthn/server"
import {  WebAuthnCredential } from "@simplewebauthn/types"
import { Models } from "node-appwrite";

export type Passkey = {
    user:Models.Database & {
        email: string;
        username: string;
    };
    webAuthnUserID: string;
    id: string;
    publicKey: WebAuthnCredential["publicKey"];
    counter: WebAuthnCredential["counter"];
    transports?: WebAuthnCredential["transports"];
    deviceType: 'singleDevice' | 'multiDevice';
    backedUp: boolean;
}


export const saveVerifiedPasskey = async (user: Models.Database & {
    email: string;
    username: string;
  }, verification:VerifiedRegistrationResponse,passkeyDbId:string) => {
    try{
        const { registrationInfo } = verification;
        if (!registrationInfo) {
            throw new Error("Registration info is undefined");
        }
        const {
            credential,
            credentialDeviceType : credentialDeviceTypeVal,
            credentialBackedUp,
          } = registrationInfo;
          
          const newPasskey:Passkey = {
            // `user` here is from Step 2
            user,
            // Created by `generateRegistrationOptions()` in Step 1
            webAuthnUserID: user.$id,
            // A unique identifier for the credential
            id: credential.id,
            // The public key bytes, used for subsequent authentication signature verification
            publicKey: credential.publicKey,
            // The number of times the authenticator has been used on this site so far
            counter: credential.counter,
            // How the browser can talk with this credential's authenticator
            transports: credential.transports,
            // Whether the passkey is single-device or multi-device
            deviceType: credentialDeviceTypeVal,
            // Whether the passkey has been backed up in some way
            backedUp: credentialBackedUp,
          };

            // Save the passkey to your database
            let updatingToDb = false;
            try{
                await database.updateDocument(db, passkeyCollection, passkeyDbId, {
                    verifiedPasskey: JSON.stringify(newPasskey),
                });
                updatingToDb = true;
            }catch{
                return {
                    success:false,
                    msg:"Unable to save the verified passkey"
                }
            }

            if (!updatingToDb){
                return {
                    success:false,
                    msg:"Unable to save the verified passkey - variable value somehw not changed "
                }
            }

            return {
                success:true,
                msg:"Verified passkey saved"
            }

            
    }catch{
        return {
            success:false,
            msg:"Unable to save the verified passkey"}
    }
}