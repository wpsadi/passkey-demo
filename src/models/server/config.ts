import { env } from '@/env';
import * as sdk from 'node-appwrite';


const client = new sdk.Client()
    .setEndpoint(env.appwrite.endpoint) // Your API Endpoint
    .setProject(env.appwrite.project) // Your project ID
    .setKey(env.appwrite.key); // Your secret API key

const users = new sdk.Users(client);
const database = new sdk.Databases(client);

export { client, users, database };