import "dotenv/config";
import dbconnect from "./db/dbconnect.js";
import { app } from "./app.js";

const PORT = process.env.PORT || 8000;

dbconnect().then(() => {
  try {
    app.on("error", (error) => {
      console.log("Error starting Express server !!", error);
      process.exit(1);
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Press Ctrl+C to stop the server`);
    });
  } catch (error) {
    console.log("Error conencting to mongodb !!", error);
  }
});
