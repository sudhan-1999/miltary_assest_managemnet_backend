import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const mongo = process.env.MONGO_URL;

async function connectToMongo() {
  const client = new MongoClient(mongo);
  await client.connect();
  console.log("Connected to MongoDB");
  return client;
}

export const client = await connectToMongo();

//asset_management.Purchase users
export const checkuser = async (userid) => {
  let user = await client
    .db("asset_management")
    .collection("users")
    .findOne({ userid: userid });
  return user;
};

export const registeruser = async (userData) => {
  return await client
    .db("asset_management")
    .collection("users")
    .insertOne(userData);
};

export async function getAllPurchases(filter = {}) {
  return client
    .db("asset_management")
    .collection("Purchase")
    .find(filter)
    .toArray();
}

export async function getalltransfer(filter = {}) {
  console.log("Filter in getalltransfer:", filter);
  return client
    .db("asset_management")
    .collection("Transfer")
    .find(filter)
    .toArray();
}

export async function Toputassigneddata(assigningdata) {
  return await client
    .db("asset_management")
    .collection("Assigned")
    .insertOne(assigningdata);
}

export async function getAllAssignedData(filter) {
  console.log("Filter in getAllAssignedData:", filter);
  return client
    .db("asset_management")
    .collection("Assigned")
    .find(filter)
    .toArray();
}
export async function transferingdata(transferdata) {
  return await client
    .db("asset_management")
    .collection("Transfer")
    .insertOne(transferdata);
}
export async function toUpdate(filter, quantityUpdate) {
  return await client
    .db("asset_management")
    .collection("Inventory")
    .updateOne(filter, {
      $set: { TotalQuantity: quantityUpdate, updatedAt: new Date() },
    });
}
export async function getinventory(filter = {}) {
  return client
    .db("asset_management")
    .collection("Inventory")
    .find(filter)
    .toArray();
}
export async function insertpurchase(purchaseData) {
  return await client
    .db("asset_management")
    .collection("Purchase")
    .insertOne(purchaseData);
}
export async function Toputinventroy(assigningdata) {
  return await client
    .db("asset_management")
    .collection("Inventory")
    .insertOne(assigningdata);
}
export async function expendedassets(expendedData) {
  return await client
    .db("asset_management")
    .collection("Expended")
    .insertOne(expendedData);
}

export async function purchasedata(Weapon, Type, Base) {
  return await client
    .db("asset_management")
    .collection("Purchase")
    .aggregate([
      { $match: { Weapon, Type, Base } },
      { $group: { _id: null, total: { $sum: "$Quantity" } } },
    ])
    .toArray();
}

export async function transferin(Weapon, Type, Base){
  return await client.db("asset_management").collection("Transfer").aggregate([
        { $match: { Weapon, Type, ToBase: Base } },
        { $group: { _id: null, total: { $sum: "$Quantity" } } }
      ]).toArray();
}
export async function transferout(Weapon, Type, Base){
  return await client.db("asset_management").collection("Transfer").aggregate([
        { $match: { Weapon, Type, FromBase: Base } },
        { $group: { _id: null, total: { $sum: "$Quantity" } } }
      ]).toArray();
}

export async function assigned(Weapon, Type, Base){
  return await client.db("asset_management").collection("Assignment").aggregate([
        { $match: { Weapon, Type, Base } },
        { $group: { _id: null, total: { $sum: "$Quantity" } } }
      ]).toArray();
}
export async function expended(Weapon, Type, Base){
  return await client.db("asset_management").collection("Expenditure").aggregate([
        { $match: { Weapon, Type, Base } },
        { $group: { _id: null, total: { $sum: "$Quantity" } } }
      ]).toArray();
}
export async function getexpended(){
  return await client
      .db("asset_management")
      .collection("Expended")
      .find()
      .toArray();
}