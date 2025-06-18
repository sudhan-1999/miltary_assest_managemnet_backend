import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const mongo=process.env.MONGO_URL;

async function connectToMongo() {
     const client=new MongoClient(mongo);
 await client.connect();
 console.log("Connected to MongoDB");
 return client;
}

export const client=await connectToMongo();

//asset_management.Purchase users
export const checkuser = async (userid) => {
   let user=await client.db("asset_management").collection("users").findOne({ userid: userid });
   return user
};

export const registeruser = async (userData) => {
  return await client.db("asset_management").collection("users").insertOne(userData);
}

export async function getAllPurchases(filter={}) {
  return client.db("asset_management").collection("Purchase").find(filter).toArray();
}


export async function getalltransfer(filter={}) {
  console.log("Filter in getalltransfer:", filter);
  return client.db("asset_management").collection("Transfer").find(filter).toArray();
}

export async function Toputassigneddata(assigningdata){
  return await client.db("asset_management").collection("Assigned").insertOne(assigningdata);
}

export async function getAllAssignedData(filter){
  console.log("Filter in getAllAssignedData:", filter);
  return client.db("asset_management").collection("Assigned").find(filter).toArray();
}