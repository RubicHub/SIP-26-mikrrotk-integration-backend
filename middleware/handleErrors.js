export const ErrorMiddleware = (err, req, res, next) => {
  if (err) {
    console.log({
      message: "There was some error in the request" + err.message,
    });
    return res
      .status(500)
      .json({ message: "There was some error in the request" + err.message });
  }
  return next();
};
