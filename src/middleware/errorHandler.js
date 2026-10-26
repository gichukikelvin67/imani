export function notFoundHandler(req,res,next){
    res.status(404).json({
        success:false,
        message:`Route not found:${req.method}${req.originalUrl}`,

    })
}
export function errorHandler(err,req,res,next){
   if(res.headersSent){
    return next(err);
   }
   const statusCode=err.statusCode || 500;
   if(statusCode >=500){
    console.error("Server error:",err);
   }
   res.status(statusCode).json({
    success:false,
    message:
    statusCode >=500
    ? "An unexpected server error occured."
    : err.message,
   })
}
//error handler gives frontend consistent JSON response.
//unexpected server errors are logged on the server without exposing internal details to customers