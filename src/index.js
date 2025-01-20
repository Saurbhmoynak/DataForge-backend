//As early as possible in your application ,import and configure dotenv

// require('dotenv').config({ path: './env' });   <--this line also works but out type is modules so we use import statement

// improved code of dotenv for consistency
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./db/database.js";
dotenv.config({
  path: './env'
})

connectDB();