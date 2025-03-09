import express, { json } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { userroute } from "./auth/Auth";
dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());

app.use("/api/v1",userroute);


const port=3000;
app.listen(port);