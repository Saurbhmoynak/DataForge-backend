//As early as possible in your application ,import and configure dotenv

// require('dotenv').config({ path: './env' });   <--this line also works but out type is modules so we use import statement

// improved code of dotenv for consistency
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./db/database.js";
import { app } from "./app.js";
dotenv.config({
  path: './env'
})

//Async Functions Always Return Promises:

// If the function body contains return value, the async function implicitly wraps value in a resolved promise (Promise.resolve(value)).
// If it throws an error, the async function returns a rejected promise.

const port = process.env.PORT;

connectDB()
  .then(() => {
    app.on('error', (error) => {
      console.log("ERRR:", error);
      throw error;
    })
    
    app.listen(port || 8000, () => {
      console.log(`Server is running at port : ${port}`);
    })
  })
  .catch((err) => {
    console.log("MongoDB connection failed !!!",err)
  })