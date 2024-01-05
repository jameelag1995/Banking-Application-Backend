import express from "express";
import { getAPIInfo } from "../controller/bankController.js";

const router = express.Router();

// display all users
router.get("/", getAPIInfo);

export default router;
