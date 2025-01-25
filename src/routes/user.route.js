import { Router } from "express"
import { registerUser,loginUser,logoutUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"


//The Router function in Express allows you to create modular, mountable route handlers.

const router = Router()

router.route('/register').post(
  //upload.fields() is a method provided by Multer, a middleware for handling file uploads in Node.js. It is used to handle multiple file uploads with different field names in a single request.
  //middleware
  upload.fields([
    {
      name: 'avatar',
      maxCount:1
    },
    {
      name: 'coverImage',
      maxCount:1
    }
  ]),
  registerUser)

router.route('/login').post(loginUser)

//secured routes
router.route('/logout').post(verifyJWT,logoutUser)

export default router;