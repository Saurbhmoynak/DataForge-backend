import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index:true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    index:true
  },
  avatar: {
    type: String, //cloudinary url
    required:true,
  },
  coverImage: {
    type: String, //cloudinary url
  },
  watchHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref:"Video",
    }
  ],
  password: {
    type: String,
    required:[true,"password is required"]
  },
  refreshToken: {
    type: String,
  }
}, { timestamps: true })

import bcrypt from "bcrypt";


//pre-hook (middleware) in Mongoose that allows you to define logic that runs before a specific Mongoose method or event (e.g., save, validate, remove, find, etc.)

userSchema.pre("save", async function (next) {
  // Ensures that the password is only hashed if it has been modified or is new. This prevents re-hashing the already hashed password during updates.
  if (!this.isModified("password")) return next();

  try {
    // Hash the password with 10 salt rounds
    //The bcrypt.hash() method is asynchronous, so you need to await it or handle it as a promise properly
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err); // Pass error to the next middleware
  }
});

userSchema.methods.isPasswordCorrect = async function (password) {
  //bcrypt.compare compares the provided password (password) with the hashed password stored in this.password.
  return await bcrypt.compare(password,this.password)
}

//Access Token:
// A short-lived token (e.g., 15 minutes to 1 hour).
// Contains detailed user information (claims), such as email, username, and fullName.
// Used to authorize access to protected resources.
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
    _id: this._id,
    email: this.email,
    username: this.username,
    fullName: this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

// Refresh Token:
// A long-lived token (e.g., 7 days to 30 days).
// Contains minimal information (e.g., just the user's _id).
// Used to request new Access Tokens without requiring the user to log in again.

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
    _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model("User", userSchema);