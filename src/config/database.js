import mongoose from "mongoose";
export async function connectDatabase(){
    const databaseUrl=process.env.MONGODB_URI;
    if(!databaseUrl){
        throw new Error("MONGODB_URI is running from the .env file.")
    }
    await mongoose.connect(databaseUrl,{
        serverSelectionTimeoutMS:10000,
    })
    console.log("MONGODB connected successfully.")
}