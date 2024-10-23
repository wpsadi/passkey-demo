import { db, passkeyCollection } from "@/models/name";
import { database } from "@/models/server/config";
import { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types";
import { Query } from "node-appwrite";

export const gettingPasskeyFromId = async (id: string) => {
    try{
        const passkeyList = await database.listDocuments(db,passkeyCollection,[Query.equal("passkeyId",id),Query.limit(1)]);

        if (passkeyList.total === 0){
            return{
                success:true,
                passkeyDBId:null,
                passkey:null,
                msg:"No passkey found for this id"
            }
        }

        return{
            success:true,
            passkeyDBId:passkeyList.documents[0].$id,
            passkey:JSON.parse(passkeyList.documents[0].passkey) as PublicKeyCredentialCreationOptionsJSON,
            msg:"Passkey found for this id"
        }

    }catch{
        return {
            success:false,
            passkey:null,
            passkeyDBId:null,
            msg:"Failed to get passkey from id"
        }
    }
}