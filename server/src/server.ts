import express from "express";
import dotenv from "dotenv";
import path from "path";

import { connectToDB } from "./config/mongo";

import { errorHandler } from "./middleware/errors";

import userRoutes from "./routes/userRoutes";
import projectRoutes from "./routes/projectRoutes";
import postRoutes from "./routes/postRoutes";
import uploadRoutes from "./routes/projectUploads";

dotenv.config();

connectToDB(process.env.MONGO_URI || "");
const app = express();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.info(`--> Server running on port ${PORT}`);
});
