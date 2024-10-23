import { db, userCollection } from "@/models/name"
import { database } from "@/models/server/config"
import { Query } from "node-appwrite"

export const getAccountFromId = async (id: string) => {
    try{
        const account  = await database.getDocument(db,userCollection,id,[Query.select(["$id","email","username"])]);

            return {
                success:true,
                account,
                msg:"Account found"
            }
    }catch{
        return {
            success:false,
            account:null,
            msg:"Failed to get account from id"
        }
    }
}