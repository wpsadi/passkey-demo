import { db,  userInfoCollection } from "@/models/name";
import { database } from "../config";
import { IndexType, Permission, Role } from "node-appwrite";

export default async function CreateUserInfoCollection(){
    try{

        await database.createCollection(db,userInfoCollection,userInfoCollection,[
            Permission.read(Role.any())],
            true,
            true
        )


        // creating attributes
        await Promise.all([
            database.createStringAttribute(db,userInfoCollection,"name",1000,true),
            database.createStringAttribute(db,userInfoCollection,"phone",1000,true),
            database.createStringAttribute(db,userInfoCollection,"address",1000,true),
            database.createStringAttribute(db,userInfoCollection,"city",1000,true),
            database.createStringAttribute(db,userInfoCollection,"state",1000,true),
            database.createStringAttribute(db,userInfoCollection,"country",1000,true),
            database.createStringAttribute(db,userInfoCollection,"pincode",1000,true),
            database.createStringAttribute(db,userInfoCollection,"dob",1000,true),])

        // creating indexes
        await Promise.all([
            database.createIndex(db,userInfoCollection,"name",IndexType.Fulltext,['name'],["asc"]),
        ])


    }catch(e){
        console.log("Failed to create UserInfo collection : \n",e);
    }
}