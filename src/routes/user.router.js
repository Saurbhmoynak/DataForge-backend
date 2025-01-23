import { Router } from "express"
import {registerUser} from "../controllers/user.controller.js"

//The Router function in Express allows you to create modular, mountable route handlers.

const router = Router()

router.route('/register').post(registerUser)

export default router;