import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import connectDB from "./config/db.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import bankRoutes from "./routes/bank.routes.js";
import apiInfo from "./routes/bankApiInfo.routes.js";
dotenv.config();

const app = express();

// cors middleware
app.use(cors());

// json parsing middleware
app.use(express.json());

// API Info middleware
app.use("/api/v1", apiInfo);

// routes middleware
app.use("/api/v1/bank", bankRoutes);

// error handler middleware
app.use(cors(), errorHandler);

// Connect DB and Run Server
const PORT = process.env.PORT || 3000;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
});
