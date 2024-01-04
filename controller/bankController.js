import BANK_CONSTANTS from "../constants/bankConstants.js";
import STATUS_CODE from "../constants/statusCodes.js";
import { User } from "../models/userModel.js";

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) {
            res.status(STATUS_CODE.NOT_FOUND);
            throw new Error("No Such User!");
        }
        res.send(user);
    } catch (error) {
        next(error);
    }
};
const createUser = async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        res.status(STATUS_CODE.CREATED).send(user);
    } catch (error) {
        next(error);
    }
};
const deposit = async (req, res, next) => {
    try {
        const id = req.params.id;
        const amount = req.body.amount;
        if (isNaN(amount) || amount <= BANK_CONSTANTS.MINIMUM_AMOUNT) {
            res.status(STATUS_CODE.BAD_REQUEST);
            throw new Error("amount must be a positive number");
        }
        const user = await User.findOneAndUpdate(
            { _id: id, isActive: true },
            { $inc: { cash: amount } },
            { new: true }
        );
        if (!user) {
            res.status(STATUS_CODE.NOT_FOUND);
            throw new Error("No such user");
        }
        res.send(user);
    } catch (error) {
        next(error);
    }
};
const updateCredit = async (req, res, next) => {
    try {
        const id = req.params.id;
        const amount = req.body.amount;
        if (isNaN(amount) || amount <= BANK_CONSTANTS.MINIMUM_AMOUNT) {
            res.status(STATUS_CODE.BAD_REQUEST);
            throw new Error("amount must be a positive number");
        }
        const user = await User.findOneAndUpdate(
            { _id: id, isActive: true },
            { $inc: { credit: amount } },
            { new: true }
        );
        if (!user) {
            res.status(STATUS_CODE.NOT_FOUND);
            throw new Error("No such user");
        }
        res.send(user);
    } catch (error) {
        next(error);
    }
};
const withdraw = async (req, res, next) => {
    try {
        const id = req.params.id;
        let amount = req.body.amount;
        if (isNaN(amount) || amount <= BANK_CONSTANTS.MINIMUM_AMOUNT) {
            res.status(STATUS_CODE.BAD_REQUEST);
            throw new Error("amount must be a positive number");
        }
        const user = await User.findOne({ _id: id, isActive: true });
        if (!user) {
            res.status(STATUS_CODE.NOT_FOUND);
            throw new Error("No such user");
        }
        if (amount <= user.credit + user.cash) {
            if (amount <= user.cash) {
                user.cash -= amount;
            } else {
                amount -= user.cash;
                user.cash = 0;
                user.credit -= amount;
            }
            await user.save();
        } else {
            res.status(STATUS_CODE.CONFLICT);
            throw new Error("You don't have enough credit or cash to withdraw");
        }
        res.send(user);
    } catch (error) {
        next(error);
    }
};
const transfer = async (req, res, next) => {
    try {
        let { senderId, receiverId, amount } = req.body;
        if (!senderId || !receiverId || !amount) {
            res.status(STATUS_CODE.BAD_REQUEST);
            throw new Error(
                "Request body must contain senderId, receiverId and amount"
            );
        }
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);
        if (!sender || !sender.isActive) {
            res.status(STATUS_CODE.BAD_REQUEST);
            throw new Error("No such id for sender");
        }
        if (!receiver || !receiver.isActive) {
            res.status(STATUS_CODE.BAD_REQUEST);
            throw new Error("No such id for receiver");
        }
        if (
            !amount ||
            isNaN(amount) ||
            amount <= BANK_CONSTANTS.MINIMUM_AMOUNT
        ) {
            res.status(STATUS_CODE.BAD_REQUEST);
            throw new Error("Amount to transfer must be a positive number");
        }
        if (amount <= sender.cash + sender.credit) {
            const originalAmountToTransfer = amount;
            if (amount <= sender.cash) {
                sender.cash -= amount;
            } else {
                amount -= sender.cash;
                sender.cash = 0;
                sender.credit -= amount;
            }
            receiver.credit += originalAmountToTransfer;
            await sender.save();
            await receiver.save();
        } else {
            res.status(STATUS_CODE.CONFLICT);
            throw new Error(
                "User trying to transfer doesn't have enough credit or cash to transfer."
            );
        }
        res.status(STATUS_CODE.OK).send({ sender, receiver });
    } catch (error) {
        next(error);
    }
};
const activate = async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        );
        if (!user) {
            res.status(STATUS_CODE.BAD_REQUEST);
            throw new Error("No such user");
        }
        res.send(user);
    } catch (error) {
        next(error);
    }
};
const deactivate = async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
        if (!user) {
            res.status(STATUS_CODE.BAD_REQUEST);
            throw new Error("No such user");
        }
        res.send(user);
    } catch (error) {
        next(error);
    }
};
const filter = async (req, res, next) => {
    try {
        const { filterType, min, max } = req.query;
        let filteredUsers;
        switch (filterType) {
            case "balance":
                filteredUsers = await User.aggregate([
                    {
                        $addFields: {
                            totalFunds: { $add: ["$cash", "$credit"] }, // Calculate total funds
                        },
                    },
                    {
                        $match: {
                            totalFunds: {
                                $gte: min,
                                $lte: max,
                            }, // Filter by total funds range
                            isActive: true, // Filter by isActive field
                        },
                    },
                ]);
                break;
            case "cash":
                console.log("cash switch");
                filteredUsers = await User.find()
                    .where("cash")
                    .gte(min)
                    .lte(max);
                break;
            case "credit":
                filteredUsers = await User.where("credit").gte(min).lte(max);
                break;

            default:
                res.status(STATUS_CODE.BAD_REQUEST);
                throw new Error("No such filter");
        }
        res.send(filteredUsers);
    } catch (error) {
        next(error);
    }
};
// const getAllUsers = async(req,res,next)=>{
//     try {

//     } catch (error) {
//         next(error);
//     }
// }

export {
    getAllUsers,
    getUserById,
    createUser,
    deposit,
    updateCredit,
    withdraw,
    transfer,
    activate,
    deactivate,
    filter,
};
