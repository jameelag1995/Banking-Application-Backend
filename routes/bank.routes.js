import express from "express";
import {
    activate,
    createUser,
    deactivate,
    deleteUserById,
    deposit,
    filter,
    getAllActiveUsers,
    getAllInActiveUsers,
    getAllUsers,
    getUserByEmail,
    getUserById,
    transfer,
    updateCredit,
    withdraw,
} from "../controller/bankController.js";
const router = express.Router();

// display all users
router.get("/", getAllUsers);
// return user info by email
router.get("/user/by-email", getUserByEmail);
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
// filter active users by balance or cash or credit
router.get("/filter/by", filter);
// get all active users
router.get("/users/active", getAllActiveUsers);
// get all Inactive users
router.get("/users/inactive", getAllInActiveUsers);
// delete user by id
router.delete("/delete/:id", deleteUserById);
export default router;
