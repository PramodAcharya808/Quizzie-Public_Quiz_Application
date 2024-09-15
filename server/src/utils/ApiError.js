class ApiError extends Error {
  constructor(statusCode, message = "Something Went Wrong !", data) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}
export { ApiError };
