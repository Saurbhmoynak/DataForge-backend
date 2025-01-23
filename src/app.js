import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

//configuration

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
//Credentials When true, it allows the browser to include credentials like cookies and authorization headers in cross-origin requests.

// No need of body-parser
app.use(express.json({ limit: "16kb" }));

// The express.json() middleware in Express.js is used to parse incoming JSON request bodies.It is a built -in middleware introduced in Express 4.16.0 and later versions.It simplifies handling JSON data in your Express applications.

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// The app.use(express.urlencoded({ extended: true, limit: "16kb" })); middleware is a configuration in an Express.js application to handle URL-encoded data, typically sent via HTML forms.

app.use(express.static("public"));

// The app.use(express.static("public")) middleware in Express.js is used to serve static files from a directory. This allows your application to make files like HTML, CSS, JavaScript, images, and other assets available to the browser without needing to define individual routes for them.

app.use(cookieParser());

// The app.use(cookieParser()); middleware in Express.js is used to parse cookies sent by the client in HTTP requests.It provides an easy way to access and manipulate cookies in your application.



//routes import
import userRouter from './routes/user.router.js'

//routes declaration
// app.use() is specifically designed to mount middleware or routers to a specific base path.

// app.use("/users", userRouter)
//Using a versioned base path like /api/v1 allows you to manage different versions of your API without breaking existing clients.
app.use("/api/v1/users", userRouter)

//here url will made as  http://localhost:8000/users/register If you defone api the http://localhost:8000//api/v1/users/register

  
export { app };