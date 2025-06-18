import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();



const jwt_secret= process.env.jwt_secret

export async function  hassing(password){
    try{
        let salt=await bcrypt.genSalt(10);
        let hashpass=await bcrypt.hash(password,salt);
        console.log("hashpass:"+hashpass)
        return hashpass;
    }catch(err){
        console.error("Error hashing password:", err);
        throw new Error("Password hashing failed");
    }
}
export async function comparingpassword(password,user){
    try{
        let isMatch=await bcrypt.compare(password,user.password);
        return isMatch;
    }catch(err){
        console.error("Error comparing password:", err);
        throw new Error("Password comparison failed");
}}

export async function generatetoken(user){
    try{
        const token=jwt.sign(
            {email:user.email,userid:user.userid,role:user.role,base:user.base},
            jwt_secret
        )
        return token;
    }catch(err){
        console.error("Error generating token:", err);
        throw new Error("Token generation failed");
    }
}

export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, jwt_secret);
    return decoded;
  }catch(err){
    console.error("Error verifying token:", err);
    throw new Error("Token verification failed");
  }}

//middleware to decode jwt
export   const authenticateToken =async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).send("Token missing or malformed");
  }
  try {
    const user = await verifyToken(token);
    console.log("Decoded user from token:", user);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).send(err.message);
  }
};
//middleware to authorize roles
export function authorizeroles(...roles){
return (req,res,next)=>{
const user=req.user;
if(!user) return res.status(401).send("unauthorized");

if(!roles.includes(user.role)){
return res.status(403).send("Forbidden: Access Denied")
}
next();
}
}

