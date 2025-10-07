import { Server } from "http";

import mongoose from "mongoose";
import { configEnv } from "./config/env";
import app from "./app";
import { seedSuperAdmin } from "./utils/seedSuperAdmin";

let server: Server;

const startSever = async () => {
  try {
    await mongoose.connect(configEnv.MONGO_URL);
    console.log("Connected to MongoDB successfully");
    server = app.listen(configEnv.PORT, () => {
      console.log("Server is running on 5000");
    });
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
};

(async ()=>{
await startSever()
await seedSuperAdmin()
})();

//error handling for graceful shutdown
//handle graceful shutdown singals error from server aws/docker etc

process.on("SIGTERM", (error) => {
  console.log("SIGTERM Rejection shutting down server", error);

  if (server) {
    server.close(() => {
      console.log("Server is closed due to unhandled rejection");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

//Handle gracefull shutdown unhandled rejections

process.on("unhandleRejection", (error) => {
  console.log("Unhandled Rejection,shutting down server", error);

  if (server) {
    server.close(() => {
      console.log("Server closed due to unhandled rejection");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle graceful shutdown uncaught exceptions
process.on("uncaughtException", (error) => {
  console.log("Uncaught Exception, shutting down server!", error);
  if (server) {
    server.close(() => {
      console.log("Server closed due to uncaught exception");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
