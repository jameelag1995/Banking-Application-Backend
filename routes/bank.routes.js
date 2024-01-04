import express from "express";
import {
    activate,
    createUser,
    deactivate,
    deposit,
    filter,
    getAllUsers,
    getUserById,
    transfer,
    updateCredit,
    withdraw,
} from "../controller/bankController.js";

const router = express.Router();

// display all users
router.get("/", getAllUsers);
// returns user info by id
router.get("/:id", getUserById);
// create new user
router.post("/", createUser);
// update user cash
router.put("/deposit/:id", deposit);
// update user credit
router.put("/update-credit/:id", updateCredit);
// withdraw money from user
router.put("/withdraw/:id", withdraw);
// transfer money between users
router.put("/transfer", transfer);
// activate user by id
router.put("/activate/:id", activate);
// deactivate user by id
router.put("/deactivate/:id", deactivate);
// filter users by balance or cash or credit
router.get("/filter/by", filter);

export default router;
