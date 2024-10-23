export const env = {
    appwrite:{
        endpoint: String(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT),
        project: String(process.env.NEXT_PUBLIC_APPWRITE_PROJECT),
        key: String(process.env.APPWRITE_KEY)
    },
    jwt:{
        secret: String(process.env.SESSION_SECRET)
    }
}