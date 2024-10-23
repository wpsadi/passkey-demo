// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { db, passkeyCollection, userCollection, userInfoCollection } from "@/models/name";
import { database } from "../config";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IndexType, Permission, RelationMutate, RelationshipType, Role } from "node-appwrite";

export default async function CreateUserCollection(){
    try{
        await database.createCollection(db,userCollection,userCollection,[
            Permission.read(Role.any())
        ],true,true);


        // creating attributes
        await Promise.all([
            database.createEmailAttribute(db,userCollection,"email",true),
            database.createStringAttribute(db,userCollection,"password",1000,true),
            database.createStringAttribute(db,userCollection,"username",100,true)
        ])

        // creating indexes
        await       database.createIndex(db,userCollection,"email",IndexType.Unique,['email'],["asc"])
        await Promise.all([
            database.createIndex(db,userCollection,"username",IndexType.Unique,['username'],["asc"]),
        ])

        // creating Relations
        // await Promise.all([
        //     database.createRelationshipAttribute(db,userCollection,passkeyCollection,RelationshipType.OneToMany,false,"passkeys",undefined,RelationMutate.Cascade),
        //     database.createRelationshipAttribute(db,userCollection,userInfoCollection,RelationshipType.OneToOne,true,"info","user",RelationMutate.Cascade)
        // ])
    }catch(e){
        console.log("Failed to create User collection : \n",e);
    }
}