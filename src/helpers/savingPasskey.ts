import { db, passkeyCollection } from "@/models/name";
import { database } from "@/models/server/config"
import { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types";
import { ID } from "node-appwrite";


export const savePasskey = async (passkey:string,userId:string)=>{
    try{
        const passkeyJSON = JSON.parse(passkey) as PublicKeyCredentialCreationOptionsJSON;
        const storeId = passkeyJSON.user.id as string;
        const saveId = ID.unique()
        let addedToPasskeyCollection = false;
        try{
            await database.createDocument(db,passkeyCollection,saveId,{
                passkey,
                userId,
                passkeyId:storeId
            })
            addedToPasskeyCollection = true
        }catch(e){
            console.log("Failed to save passkey : \n",e)
            return {
                success : false,
                msg: "Failed to save passkey"
            }
        }

        if (!addedToPasskeyCollection){
            return {
                success : false,
                msg: "Failed to save passkey - variable value somehw not changed "
            }
        }



        return {
            success:true,
            msg:"Passkey saved"
        }




    }catch{
        return {
            success:false,
            msg:"Failed to save passkey"
        }
    }
}