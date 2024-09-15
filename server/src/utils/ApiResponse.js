class ApiResponse {
  constructor(statusCode, message = "SUCCESS", data) {
    this.status = statusCode;
    this.message = message;
    this.data = data;
  }
}

export { ApiResponse };
