import { asyncHandler } from "../utils/asyncHandler.js";


const registerUser = asyncHandler(async (req, res) => {

  //res.status(200):Sets the HTTP status code to 200, indicating the request was successful.
  //.json({ message: "ok" }):Converts the JavaScript object { message: "ok" } into a JSON string.

  res.status(200).json({
    message: "ok"
    //Sends the JSON string to the client with the appropriate headers (Content-Type: application/json).
  })
})

export { registerUser };

