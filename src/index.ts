import express from "express";
import dotenv from "dotenv";
import { Account } from "./account/azure";
dotenv.config();
const app=express();

app.post("/nodejs",Account);
const port=3000;
app.listen(port);