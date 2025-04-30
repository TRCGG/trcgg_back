
/* Middleware to intercept responses and standardize the response format
 */

module.exports = (req, res, next) => {
  const oldJson = res.json;

  res.success = (data = null, message = "success") => {
    return oldJson.call(res, {
      status: "ok",
      message,
      data,
    });
  };

  res.error = (message = "error", code = 500, data = null) => {
    return res.status(code).json({
      status: "error",
      message,
      data,
    })
  };

  res.badRequest = (message = "bad request", data = null) => {
    return res.error(message, 400, data);
  };
  
  res.unauthorized = (message = "Unauthorized", data = null) => {
    return res.error(message, 401, data);
  };

  res.notFound = (message = "Not Found Data", data = null) => {
    return res.error(message, 403, data);
  };

  res.internalError = (message = "Internal Server Error", data = null) => {
    return res.error(message, 500, data);
  };
  
  next();
}