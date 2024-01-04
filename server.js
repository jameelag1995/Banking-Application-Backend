import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import connectDB from "./config/db.js";
import { errorHandler } from "./middlewares/errorMiddleware.js";
import bankRoutes from "./routes/bank.routes.js";
dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/v1/bank", bankRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`);
    });
});
