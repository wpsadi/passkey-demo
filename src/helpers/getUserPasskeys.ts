import { db, passkeyCollection } from "@/models/name"
import { database } from "@/models/server/config"
import { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/types";
import { Query } from "node-appwrite";

export const getUserPasskeys = async (id:string) => {
    try{
        const userPasskeysList = await database.listDocuments(db,passkeyCollection,[Query.equal("userId",id),Query.select(["$id","passkey","verifiedPasskey"])]);
        if (userPasskeysList.total === 0){
            return{
                total:0,
                success:true,
                passkeys:[],
                msg:"No passkeys found for this user"
            }
        }

        return{
            total:userPasskeysList.total,
            success:true,
            passkeys:userPasskeysList.documents.map(doc=>{
                if (doc.verifiedPasskey == null){
                    return {
                        $id:doc.$id,
                        verified:false,
                        passkey:JSON.parse(doc.passkey)
                    }
                }
                else{
                    return {
                        $id:doc.$id,
                        verified:true,
                        passkey:JSON.parse(doc.passkey)
                    }
                }
            }) as unknown as { $id: string; passkey: {verified:boolean} & PublicKeyCredentialCreationOptionsJSON  }[],
            msg:"All passkeys found for this user"
        }

    }catch(e){
        console.log(e)
        return {
            total:0,
            success:false,
            passkeys:null,
            msg:"Failed to get passkeys from id"}
    }
}