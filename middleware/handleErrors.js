export const ErrorMiddleware = (err, req, res, next) => {
  if (err) {
    console.log({
      message: "There was some error in the request " + err.message,
      status: err.status,
    });
    return res.status(err.status || 500).json({
      message: "There was some error in the request " + err.message,
      status: err.status,
    });
  }
  return next();
};
