import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { Account, fetchfile } from "../account/azure";
import { Router } from "express";
import z from "zod"

const prisma=new PrismaClient();
const  router=Router();
const user=z.object({
    name:z.string(),
    email:z.string().email({message:"Email Format is not correct"}),
    password:z.string().min(8,{message:"Password Must be minimum 8 "}).max(10,{message:"Password Must be maximum 10"})
})
router.post("/signup",async(req:any,res:any)=>{
   const valid=user.safeParse(req.body);
   if(!valid.success){
    return res.status(400).json({message:valid.error.errors[0].message});
   }
    const {name,email,password}=valid.data;
    if(!name||!email||!password){
        res.status(400).json({message:"Kindly provide the required fields"});
    }
    const unique=await prisma.user.findFirst({
        where:{
            email
        }
    })
    if(unique){
        return res.status(400).json({message:"Email alredy existt"});
    }
    const bycrpt=await bcrypt.genSalt(10);
    const hashpassword=await bcrypt.hash(password,bycrpt);
    const newuser=await prisma.user.create({
        data:{
            name,
            email,
            password:hashpassword
        }
    }) 
   const jwtoken=jwt.sign({id:newuser.id},process.env.JWT_SECRET||"jwtscet");
   return res.status(200).json({token:jwtoken});
})
router.post("/login",async(req:any,res:any)=>{
    const {email,password}=req.body;
    if(!email||!password){
        res.json({message:"kindly provide the required detail"});
    }
    const Email=await prisma.user.findUnique({
        where:{
            email
        }
    })
    if(!Email){
        res.json({messgae:"NO email found"})
        return;
    }
    const comparepassword=bcrypt.compareSync(password,Email.password);
    if(!comparepassword){
        res.json({message:"Password dont match"});
        return;
    }
    const token=jwt.sign({id:Email?.id},process.env.JWT_TOKEN||"jwtokenn");
    res.json({token:token});
})
router.post("/codebase",async(req:any,res:any)=>{
    const {language,id}=req.body;
    if(!language){
        res.json({message:"No language found"});
        return;
    }
    const user=await prisma.user.findFirst({
        where:{
            id,
        }
    })
    if(!user){
        res.json({message:"No user found for this email id"});
        return;
    }
    await prisma.codebases.create({
        data:{
            language,
            userid:user.id
      }
    })
    await  Account(language,user.id);
 await fetchfile(language,user.id);
    res.json({message:"Code base is create for you"});

});
export const userroute=router;