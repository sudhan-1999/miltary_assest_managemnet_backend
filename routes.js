import express from "express";
import { checkuser, getAllPurchases, getalltransfer, registeruser } from "./queries.js";
import {
  hassing,
  generatetoken,
  comparingpassword,
  authenticateToken,
  authorizeroles,
  verifyToken,
} from "./helper.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
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
    const newUser = ({
      name,
      userid,
      password: hashedPassword,
      role,
      base,
      creatredAt: new Date(),
    });
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
//filter need to check
router.get(
  "/purchase",
  authenticateToken,
  authorizeroles("logistic officer", "admin","commander"),
  async (req, res) => {
    try {
      const user = req.user;
      let filter = {};
      let token = req.headers.authorization;

      let verification=await verifyToken(token);
      if(!verification){
        return res.status(401).send("Unauthorized");
      }
      if (!user) {
        return res.status(401).send("Unauthorized");
      }
      let userdata=await checkuser(user.userid);
      console.log("User found:", userdata);
      if (user.role === "commander" || user.role === "logistic officer") {
        filter.Base = userdata.base;
        console.log("Filter for commander/logistic officer:", filter);
      }
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
//need to check filter except admin
router.get("/transfer",authenticateToken,
  authorizeroles("logistic officer","commander","admin"),async (req,res)=>{
    try{
      let filter = {};
      const user = req.user;
      let token = req.headers.authorization;

      if (!user) {
        return res.status(401).send("Unauthorized");
      }
     let verification= await verifyToken(token);
      if(!verification){
        return res.status(401).send("Unauthorized");
      }
      if (!user) {
        return res.status(401).send("Unauthorized");
      }
      let userdata=await checkuser(user.userid);
      console.log("User found:", userdata.base);
      if (user.role === "commander" || user.role === "logistic officer") {
        filter.FromBase = userdata.base;
        console.log("Filter for commander/logistic officer:", filter);
      }
      let tranferdata=await getalltransfer(filter)
      console.log(filter)
      console.log("tranferdata history:", tranferdata);
      if (!tranferdata || tranferdata.length === 0) {
        return res.status(404).send("No purchase history found");
      }
      res.status(200).send(tranferdata);

    }catch(err){
      console.error("Error during transfer:", err);
      res.status(500).send("Internal server error");
    }
  })
export default router;
