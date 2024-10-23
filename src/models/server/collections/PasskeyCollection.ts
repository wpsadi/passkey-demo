import { db, passkeyCollection } from "@/models/name";
import { database } from "../config";
import { IndexType, Permission, Role } from "node-appwrite";

export default async function CreatePasskeyCollection(){
    try{
        await database.createCollection(db,passkeyCollection,passkeyCollection,[
            Permission.read(Role.any())
        ],
    true,true);




    // creating attributes
    await Promise.all([
        database.createStringAttribute(db,passkeyCollection,"passkeyId",100,true),
        database.createStringAttribute(db,passkeyCollection,"passkey",100000,true),
        database.createStringAttribute(db,passkeyCollection,"verifiedPasskey",1000000,false),
        database.createStringAttribute(db,passkeyCollection,"userId",100,true),
    ])

    // creating index
    await Promise.all([
        database.createIndex(db,passkeyCollection,"passkeyId",IndexType.Unique,['passkeyId'],["asc"]),
    ])

    }catch(e){
        console.log("Failed to create Passkey collection : \n",e);
    }
}