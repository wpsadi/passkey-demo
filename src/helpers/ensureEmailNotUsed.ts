import { db, userCollection } from "@/models/name";
import { database } from "@/models/server/config";
import { emailSchema } from "@/validators/emailValidators";
import { Query } from "node-appwrite";

export const ensureEmailNotUsed = async (email: string) => {
    try{
        // validate email
        const isEmail = emailSchema.safeParse(email);
        if (!isEmail.success) {
            return {
                success:false,
                unique:false,
                msg: isEmail.error.errors[0].message || "Invalid email"
            }
        }
        const response = await database.listDocuments(db,userCollection,[Query.limit(1),Query.select(["$id"]), Query.equal("email",isEmail.data)]);
        if(response.documents.length === 0){
            return {
                success:true,
                unique:true,
                email:isEmail.data,
                msg:"Email is unique"
            }}

        return { 
            success:true,
            unique:false,
            email:null,
            msg:"Email alerady used by another account"
        }
    }catch{
        return {
            success:false,
            unique:false,
            email:null,
            msg:"Failed to check email"
        }
    }
}