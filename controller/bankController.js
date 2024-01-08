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

const validateEmail = (email) => {
    const emailRegex = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value);
};
const createUser = async (req, res, next) => {
    try {
        if (req.body.password.length < 8) {
            res.status(STATUS_CODE.BAD_REQUEST);
            throw new Error("Password must be at least 8 characters");
        }
        if (req.body.userId.length !== 9) {
            res.status(STATUS_CODE.BAD_REQUEST);
            throw new Error("ID must be at least 9 digits");
        }
        if (!validateEmail(req.body.email)) {
            res.status(STATUS_CODE.BAD_REQUEST);
            throw new Error("invalid email, example: email@example.com");
        }
        const user = await User.create(req.body);
        res.status(STATUS_CODE.CREATED).send(user);
    } catch (error) {
        console.log(error);
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
        let { filterType, min, max } = req.query;
        if (isNaN(min)) min = BANK_CONSTANTS.MINIMUM_AMOUNT;
        if (isNaN(max)) max = Number.MAX_SAFE_INTEGER;
        let filteredUsers;
        switch (filterType) {
            case "balance":
                const users = await User.find();
                filteredUsers = users.filter(
                    (user) =>
                        user.credit + user.cash >= min &&
                        user.credit + user.cash <= max
                );
                // filteredUsers = User.find({
                //     $expr: {
                //         $and: [
                //             { $gte: [{ $add: ["$cash", "$credit"] }, min] },
                //             { $lte: [{ $add: ["$cash", "$credit"] }, max] },
                //         ],
                //     },
                // });
                break;
            case "cash":
                filteredUsers = await User.find({ isActive: true })
                    .where("cash")
                    .gte(min)
                    .lte(max);
                break;
            case "credit":
                filteredUsers = await User.find({ isActive: true })
                    .where("credit")
                    .gte(min)
                    .lte(max);
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
const getAllActiveUsers = async (req, res, next) => {
    try {
        const users = await User.find({ isActive: true });
        if (!users || !users.length) {
            res.status(STATUS_CODE.NOT_FOUND).send("No active users");
        }
        res.send(users);
    } catch (error) {
        next(error);
    }
};
const getAllInActiveUsers = async (req, res, next) => {
    try {
        const users = await User.find({ isActive: false });
        if (!users || !users.length) {
            res.status(STATUS_CODE.NOT_FOUND);
            throw new Error("No inactive users");
        } else {
            res.send(users);
        }
    } catch (error) {
        next(error);
    }
};

const getUserByEmail = async (req, res, next) => {
    try {
        const email = req.query.email;
        const user = await User.find({ email });
        if (!user) {
            res.status(STATUS_CODE.NOT_FOUND);
            throw new Error("Email doesn't exist!");
        }
        res.send(user);
    } catch (error) {
        next(error);
    }
};

const deleteUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const deletedUser = await User.deleteOne({ _id: id });
        if (!deleteUserById) {
            res.status(STATUS_CODE.NOT_FOUND);
            throw new Error("No such user");
        }
        res.send(deletedUser);
    } catch (error) {
        next(error);
    }
};

const getAPIInfo = (req, res, next) => {
    res.send({
        getAllUsers: "GET /api/v1/bank - Shows All Users Info",
        getUserByEmail:
            "GET /api/v1/user/by-email - return user with given email query",
        getAllActiveUsers:
            "GET /api/v1/bank/users/active - Shows All Active Users",
        getAllInActiveUsers:
            "GET /api/v1/bank/users/inactive - Shows All Inactive Users",
        createUser: "POST /api/v1/bank - Creates New User",
        getUserById: "GET /api/v1/bank/:id - Shows User Info",
        deposit: "PUT /api/v1/bank/deposit/:id - Deposit Money To User's Cash",
        updateCredit:
            "PUT /api/v1/bank/update-credit/:id - Update User's Credit",
        withdraw:
            "PUT /api/v1/bank/withdraw/:id - Withdraw Money From User's Account",
        transfer:
            "PUT /api/v1/bank/transfer - Transfer Money Between Bank Accounts",
        activate: "PUT /api/v1/bank/activate/:id - Activates User",
        deactivate: "PUT /api/v1/bank/deactivate/:id - Deactivates User",
        deleteUserById: "DELETE /api/v1/bank/delete/:id - Delete User",
        filterActiveUsersByBalance:
            "GET /api/v1/bank/filter/by?filterType=balance&min=MinAmount&max=MaxAmount - Shows Active Users with Given Balance",
        filterActiveUsersByCash:
            "GET /api/v1/bank/filter/by?filterType=cash&min=MinAmount&max=MaxAmount - Shows Active Users with Given Cash",
        filterActiveUsersByCredit:
            "GET /api/v1/bank/filter/by?filterType=credit&min=MinAmount&max=MaxAmount - Shows Active Users with Given Credit",
    });
};

export {
    getAllUsers,
    getUserByEmail,
    getUserById,
    createUser,
    deposit,
    updateCredit,
    withdraw,
    transfer,
    activate,
    deactivate,
    filter,
    getAllActiveUsers,
    getAllInActiveUsers,
    getAPIInfo,
    deleteUserById,
};
