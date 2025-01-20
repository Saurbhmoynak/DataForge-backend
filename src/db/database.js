import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
//if write path like ../constants --> it will give error you have to give full filename with extention

const connectDB = async() => {
  try {
    //mongoose actually returns a object which contains connection instance(jisme hume connectionInstance se response milta hai)
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);

    //The connectionInstance.connection.host is a way to retrieve the host (hostname or IP address) of the database server to which your application is connected

    //Suppose your MONGO_URI is mongodb+srv://username:password@cluster0.mongodb.net/myDatabase. After connection, the connectionInstance.connection.host will likely show the hostname of your cluster, such as cluster0.mongodb.net

  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1); // Exit if database connection fails

  }
}

export default connectDB;