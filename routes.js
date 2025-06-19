import express from "express";
import {
  assigned,
  checkuser,
  client,
  expended,
  expendedassets,
  getAllAssignedData,
  getAllPurchases,
  getalltransfer,
  getexpended,
  getinventory,
  insertpurchase,
  purchasedata,
  registeruser,
  Toputassigneddata,
  Toputinventroy,
  toUpdate,
  transferin,
  transferingdata,
  transferout,
} from "./queries.js";
import {
  hassing,
  generatetoken,
  comparingpassword,
  authenticateToken,
  authorizeroles,
  verifyToken,
} from "./helper.js";

const router = express.Router();

router.post("/register",authenticateToken,
  authorizeroles("logistic officer", "admin", "commander"), async (req, res) => {
  try {
    const user = req.user;
    console.log("User from request:", user);
    let token = req.headers.authorization;
    let verification = await verifyToken(token);  
    if (!verification) {
      return res.status(401).send("Unauthorized");  
    }
    if (!user) {  
      return res.status(401).send("Unauthorized");
    }
    if (user.role !== "admin") {
      return res.status(403).send("Forbidden: Only admin can register users");
    }
    console.log("User role is admin, proceeding with registration");
    const { name, userid, password, role, base } = req.body;
    console.log("Received registration data:", req.body);

    if (!name || !userid || !password || !role || !base) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await checkuser(userid);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hassing(password);
    const newUser = {
      name,
      userid,
      password: hashedPassword,
      role,
      base,
      creatredBy: user.userid,
      creatredAt: new Date(),
    };
    console.log("newUser:", newUser);
    await registeruser(newUser);

    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { userid, password } = req.body;
    console.log("Received login data:", req.body);
    const user = await checkuser(userid);
    console.log("User found:", user);
    if (!user) {
      return res.status(400).send("user not found");
    }
    const checkpassword = await comparingpassword(password, user);
    console.log("Password match:", checkpassword);
    if (!checkpassword) {
      return res.status(400).send("Invalid credentials");
    }
    const jwt_token = await generatetoken(user);
    console.log("Generated JWT token:", jwt_token);
    if (!jwt_token) {
      return res.status(500).send("Token generation failed");
    }
    res
      .status(200)
      .send({ user: user, token: jwt_token, message: "Login successful" });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Internalserver error!");
  }
});

router.get(
  "/purchasehistory",
  authenticateToken,
  authorizeroles("logistic officer", "admin", "commander"),
  async (req, res) => {
    try {
      const user = req.user;
      console.log("User from request:", user);
      let filter = {};
      let token = req.headers.authorization;

      let verification = await verifyToken(token);
      if (!verification) {
        return res.status(401).send("Unauthorized");
      }
      if (!user) {
        return res.status(401).send("Unauthorized");
      }
      //let userdata=await checkuser(user.userid);
      console.log("User found:", user.base);
      if (user.role === "commander" || user.role === "logistic officer") {
        filter.Base = new RegExp(`^${user.base}$`, "i"); //here used user.base instead of user.base
        console.log(user.role, "has access to base:", user.base);
        console.log("Filter for commander/logistic officer:", filter);
      }
      console.log("Filter for purchase history:", filter);
      const purchaseHistory = await getAllPurchases(filter);

      console.log("Purchase history:", purchaseHistory);
      if (!purchaseHistory || purchaseHistory.length === 0) {
        return res.status(404).send("No purchase history found");
      }
      res.status(200).send(purchaseHistory);
    } catch (err) {
      console.error("Error during purchase:", err);
      res.status(500).send("Internal server error");
    }
  }
);

router.get(
  "/transfered",
  authenticateToken,
  authorizeroles("logistic officer", "commander", "admin"),
  async (req, res) => {
    try {
      let filter = {};
      const user = req.user;
      let token = req.headers.authorization;
      let verification = await verifyToken(token);
      if (!verification) {
        return res.status(401).send("Unauthorized");
      }
      if (!user) {
        return res.status(401).send("Unauthorized");
      }
      //let userdata=await checkuser(user.userid);
      //console.log("User found:", userdata.base);
      if (user.role === "commander" || user.role === "logistic officer") {
        filter.FromBase = new RegExp(`^${user.base}$`, "i"); //here used user.base instead of userdata.base
        console.log("Filter for commander/logistic officer:", filter);
      }
      let tranferdata = await getalltransfer(filter);
      console.log(filter);
      console.log("tranferdata history:", tranferdata);
      if (!tranferdata || tranferdata.length === 0) {
        return res.status(404).send("No Transfer history found");
      }
      res.status(200).send(tranferdata);
    } catch (err) {
      console.error("Error during transfer:", err);
      res.status(500).send("Internal server error");
    }
  }
);

router.post(
  "/assign",
  authenticateToken,
  authorizeroles("logistic officer", "commander", "admin"),
  async (req, res) => {
    try {
      const { Weapon, AssignedTo, AssignedBy, Base } = req.body;
      console.log("Received assignment data:", req.body);
      const user = req.user;
      console.log("User from request:", user.role);
      let token = req.headers.authorization;
      let verification = await verifyToken(token);
      if (!verification) {
        return res.status(401).send("Unauthorized");
      }
      if (!user) {
        return res.status(401).send("Unauthorized");
      }
      if (user.role === "logistic officer") {
        return res
          .status(403)
          .send("Forbidden: Only commanders or admin can assign weapons");
      }
      const assigningdata = {
        Weapon,
        AssignedTo,
        AssignedBy,
        Base,
        AssigningDate: new Date(),
      };
      const assigned = await Toputassigneddata(assigningdata);
      console.log("Assignment data:", assigned);
      res.status(200).send({ message: "Asset  assigned successfully" });
    } catch (err) {
      console.error("Error during assignment:", err);
      res.status(500).send("Internal server error");
    }
  }
);
router.get(
  "/assigned",
  authenticateToken,
  authorizeroles("logistic officer", "commander", "admin"),
  async (req, res) => {
    try {
      const user = req.user;
      let token = req.headers.authorization;
      let verification = await verifyToken(token);
      const filter = {};
      if (!verification) {
        return res.status(401).send("Unauthorized");
      }
      if (!user) {
        return res.status(401).send("Unauthorized");
      }
      if (user.role === "commander" || user.role === "admin") {
        filter.Base = new RegExp(`^${user.base}$`, "i");
        console.log(user.role, "has access to base:", user.base);
      } else if (user.role === "logistic officer") {
        return res
          .status(403)
          .send(
            "Forbidden: Only commanders or admin can view assigned weapons"
          );
      }
      console.log("Filter for assigned weapons:", filter);
      const assignedData = await getAllAssignedData(filter);
      res.status(200).send(assignedData);
    } catch (err) {
      console.error("Error during assigned:", err);
      res.status(500).send("Internal server error");
    }
  }
);
router.post(
  "/transfer",
  authenticateToken,
  authorizeroles("logistic officer", "commander", "admin"),
  async (req, res) => {
    try {
      const { Weapon, Type, Quantity, FromBase, ToBase, TransferredBy } =
        req.body;
      console.log("Received transfer data:", req.body);
      const filter = {};
      const user = req.user;
      let token = req.headers.authorization;
      let verification = await verifyToken(token);
      if (!verification) {
        return res.status(401).send("Unauthorized");
      }
      if (!user) {
        return res.status(401).send("Unauthorized");
      }

      if (user.role === "commander" || user.role === "logistic officer") {
        filter.Base = new RegExp(`^${FromBase}$`, "i");
      } else if (user.role === "admin") {
        filter.Base = new RegExp(`^${FromBase}$`, "i");
      }

      filter.Weapon = new RegExp(`^${Weapon}$`, "i");
      const inventory = await getinventory(filter);
      console.log("inventory:", inventory);
      if (inventory.length === 0) {
        return res
          .status(404)
          .send(
            "No purchase history found for this weapon at the specified base"
          );
      }

      const transferData = {
        Weapon,
        inventoryId: inventory[0]._id,
        Type,
        Quantity,
        FromBase,
        ToBase,
        TransferredBy,
        TransferDate: new Date(),
      };
      if (
        transferData.FromBase.trim().toLowerCase() !==
        user.base.trim().toLowerCase()
      ) {
        return res
          .status(403)
          .send("Forbidden: You can only transfer assets from your own base");
      }

      if (inventory[0].TotalQuantity >= transferData.Quantity) {
        const quantityUpdate =
          inventory[0].TotalQuantity - transferData.Quantity;
        await transferingdata(transferData);
        const updated = await toUpdate(filter, quantityUpdate);
        console.log("updated:", updated);
        res.status(200).send({ message: "Asset transferred successfully" });
      } else {
        return res
          .status(400)
          .send("Insufficient quantity available for transfer");
      }
    } catch (err) {
      console.error("Error during transfer:", err);
      res.status(500).send("Internal server error");
    }
  }
);
router.post(
  "/purchase",
  authenticateToken,
  authorizeroles("logistic officer", "admin"),
  async (req, res) => {
    try {
      const { Weapon, Type, Quantity, Base } = req.body;
      console.log("Received purchase data:", req.body);
      const user = req.user;
      let token = req.headers.authorization;
      let verification = await verifyToken(token);
      if (!verification) {
        return res.status(401).send("Unauthorized");
      }
      if (!user) {
        return res.status(401).send("Unauthorized");
      }
      if (user.role !== "admin" && user.role !== "logistic officer") {
        return res
          .status(403)
          .send("Forbidden: Only admin/logistic officer can make purchases");
      }
      const purchaseData = {
        Weapon,
        Type,
        Quantity,
        PurchaseDate: new Date(),
        Base,
      };
      console.log("Purchase data:", purchaseData);
      const purchaseHistory = await insertpurchase(purchaseData);
      const checkinvetory = await getinventory({
        Weapon: new RegExp(`^${Weapon}$`, "i"),
        Base: new RegExp(`^${Base}$`, "i"),
      });
      if (checkinvetory.length === 0) {
        const newInventory = {
          Base,
          Weapon,
          Type,
          TotalQuantity: Quantity,
        };
        await Toputinventroy(newInventory);
        console.log("New inventory item created:", newInventory);
      }
      if (checkinvetory[0]) {
        const quantityUpdate =
          checkinvetory[0].TotalQuantity + purchaseData.Quantity;
        console.log("inventory", checkinvetory.TotalQuantity);
        console.log("Total quantity to be updated:", quantityUpdate);
        const filter = {
          Weapon: new RegExp(`^${Weapon}$`, "i"),
          Base: new RegExp(`^${Base}$`, "i"),
        };
        console.log("Filter for inventory update:", filter);
        await toUpdate(filter, quantityUpdate);
      }
      console.log("Purchase history:", purchaseHistory);
      res.status(200).send({ message: "Asset purchased successfully" });
    } catch (err) {
      console.error("Error during purchase:", err);
      res.status(500).send("Internal server error");
    }
  }
);
router.post(
  "/expendedasset",
  authenticateToken,
  authorizeroles( "commander", "admin"),
  async (req, res) => {
    try {
      const { Weapon, Type, Quantity,Reason, Base } = req.body;
      console.log("Received expended asset data:", req.body);
      const user = req.user;
      let token = req.headers.authorization;
      let verification = await verifyToken(token);
      if (!verification) {
        return res.status(401).send("Unauthorized");
      }
      if (!user) {
        return res.status(401).send("Unauthorized");
      }
      if (user.role !== "admin" && user.role !== "commander") {
        return res
          .status(403)
          .send("Forbidden: Only admin/commander can expend assets");
      }

      const expendedData = {
        Weapon,
        Type,
        Quantity,
        Reason,
        Base,
        ExpendedDate: new Date(),
        ExpendedBy: user.userid,
      };

      console.log("Expended asset data:", expendedData);
      await expendedassets(expendedData);

      const checkinvetory = await getinventory({
        Weapon: new RegExp(`^${Weapon}$`, "i"),
        Base: new RegExp(`^${Base}$`, "i"),
      });
      if (checkinvetory.length === 0) {
        return res
          .status(404)
          .send("No inventory found for this weapon at the specified base");
      }
      console.log(" inventory item :", checkinvetory[0]);
      if (checkinvetory[0]) {
        const quantityUpdate =
          checkinvetory[0].TotalQuantity - expendedData.Quantity;
        console.log("inventory", checkinvetory.TotalQuantity);
        console.log("Total quantity to be updated:", quantityUpdate);
        const filter = {
          Weapon: new RegExp(`^${Weapon}$`, "i"),
          Base: new RegExp(`^${Base}$`, "i"),
        };
        console.log("Filter for inventory update:", filter);
        await toUpdate(filter, quantityUpdate);
      }
      res.status(200).send({ message: "Asset expended successfully" });
    } catch (err) {
      console.error("Error during expended asset:", err);
      res.status(500).send("Internal server error");
    }
  }
);

router.get('/dashboard', authenticateToken,authorizeroles("logistic officer","commander","admin"),async (req, res) => {
  try {
    const user = req.user; 
    console.log("User from request:", user);
    let token = req.headers.authorization; 
    let verification = await verifyToken(token);
      if (!verification) {
        return res.status(401).send("Unauthorized");
      }
      if (!user) {
        return res.status(401).send("Unauthorized");
      } 
    let filter = {};
    if (user.role !== "admin") {
      filter.Base = user.base;
    }
    const inventory = await client.db("asset_management").collection("Inventory").find(filter).toArray();
console.log("Inventory data:", inventory);
    const report = [];

    for (const item of inventory) {
      const { Weapon, Type, Base } = item;

      const purchase = await purchasedata(Weapon, Type, Base);
      const transferedIn = await transferin(Weapon, Type, Base);
      const transferedOut = await transferout(Weapon, Type, Base);
      const assigneddata = await assigned(Weapon, Type, Base);
      const expendeddata = await expended(Weapon, Type, Base);

      const PurchaseQty = purchase[0]?.total || 0;
      const TransferedIn = transferedIn[0]?.total || 0;
      const TransferedOut = transferedOut[0]?.total || 0;
      const AssignedQuantity = assigneddata[0]?.total || 0;
      const ExpendedQuantity = expendeddata[0]?.total || 0;
      const ClosingBalance = item.TotalQuantity;
      const NetMovement = PurchaseQty + TransferedIn - TransferedOut - AssignedQuantity - ExpendedQuantity;
      const OpeningBalance = ClosingBalance - NetMovement;

      report.push({
        Weapon,
        Type,
        Base,
        OpeningBalance,
        PurchaseQty,
        TransferedIn,
        TransferedOut,
        AssignedQuantity,
        ExpendedQuantity,
        NetMovement,
        ClosingBalance
      });
    }
console.log("Generated report:", report);
    if (report.length === 0) {
      return res.status(404).send("No asset movement data found ");
    }
    res.status(200).json(report);
  } catch (error) {
    console.error("Error generating asset movement summary:", error);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/expendedassets", authenticateToken,
  authorizeroles("commander", "admin"),async (req, res) => {
  try {
    const user = req.user;
    const filter={};
    console.log("User from request:", user);
    let token = req.headers.authorization;
    let verification = await verifyToken(token);
    if (!verification) {
      return res.status(401).send("Unauthorized");
    }
    if (!user) {
      return res.status(401).send("Unauthorized");
    }
    if (user.role !== "admin" && user.role !== "commander") {
      return res
        .status(403)
        .send("Forbidden: Only admin/commander can view expended assets");
    }
    if(user.role === "commander" ){
      filter.Base = new RegExp(`^${user.base}$`, "i");
    }
    const expendedAssets = await getexpended();
  
    console.log("Expended assets:", expendedAssets);
    if (!expendedAssets[0] || expendedAssets.length === 0) {
      return res.status(404).send("No expended assets found");
    }
    res.status(200).send(expendedAssets);
  }catch (error) {
    console.error("Error fetching expended assets:", error);
    res.status(500).send("Internal Server Error");
  }});

export default router;
