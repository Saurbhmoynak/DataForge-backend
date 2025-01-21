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