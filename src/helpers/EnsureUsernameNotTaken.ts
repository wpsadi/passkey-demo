import { db, userCollection } from "@/models/name"
import { database } from "@/models/server/config"
import { usernameSchema } from "@/validators/usernameValidator"
import { Query } from "node-appwrite"

export const ensureUsernameNotTaken = async (username: string) => {
    try{
        // validate username
        const isUsername = usernameSchema.safeParse(username);
        if (!isUsername.success) {
            return {
                success:false,
                unique:false,
                msg: isUsername.error.errors[0].message || "Invalid username"
            }
        }
        const response = await database.listDocuments(db,userCollection,[Query.limit(1),Query.select(["$id"]), Query.equal("username",isUsername.data)]);
        if(response.documents.length === 0){
            return {
                success:true,
                unique:true,
                username:isUsername.data,
                msg:"Username is unique"
            }}

        return { 
            success:true,
            unique:false,
            username:null,
            msg:"Username is not unique"
        }
    }catch{
        return {
            success:false,
            unique:false,
            username:null,
            msg:"Failed to check username"
        }
    }
}