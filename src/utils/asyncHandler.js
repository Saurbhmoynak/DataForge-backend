//acts as a middleware wrapper for handling asynchronous functions in a Node.js/Express application. Its primary purpose is to catch and forward errors from asynchronous operations to the Express error-handling middleware, ensuring clean and concise code.
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
  }
}

export { asyncHandler };
  
// 2 way 
  
// const asyncHandler = () => { }
// const asyncHandler = (func) => () => { }
// //how to make async
// const asyncHandler = (func) => async () => { }

// wrapper function created by using try ..catch

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next)
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message:err.message
//     })
//   }
//  }