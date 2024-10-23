import { db } from "../name";
import CreatePasskeyCollection from "./collections/PasskeyCollection";
import CreateUserCollection from "./collections/UserCollections";
import CreateUserInfoCollection from "./collections/UserInfoCollection";
import { database } from "./config";

export default async function SetupDB(){
    try{
        // trying to see if db exist
        // await database.delete(db);
        await database.get(db);
        console.log("DB connection exists");
    }catch{
        // if db does not exist, create it
        console.log("Creating DB connection");
        try{
            await database.create(db,db,true);
            console.log("DB connection created");


            // creating collections
            console.log("Creating collections");
            // await Promise.all([
               
                await CreateUserInfoCollection()
                await CreatePasskeyCollection()
                await CreateUserCollection()
            // ])

            console.log("Collections created");
        }catch(e){
            console.log("Failed to setup DB : \n",e);
        }
       
    }
}