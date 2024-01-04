import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            validate: {
                validator: function (userId) {
                    // Regular expression to check if userId is a 9-digit number starting with 0 or any other digit
                    return /^\d{9}$/.test(userId);
                },
                message: (props) =>
                    `${props.value} is not a valid userId. It must be a 9-digit number.`,
            },
        },
        firstName: {
            type: String,
            minlength: [1, "First name must include one letter at least"],
            required: true,
        },
        lastName: {
            type: String,
            minlength: [1, "Last name must include one letter at least"],
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            validate: {
                validator: function (value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(value);
                },
                message: "invalid email address",
            },
        },
        password: {
            type: String,
            required: true,
            minlength: [8, "Password must be at least 8 characters"],
        },
        cash: {
            type: Number,
            default: 0,
            min: [0, "Cash Must be positive"],
        },
        credit: {
            type: Number,
            default: 0,
            min: [0, "Credit Must be positive"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);


userSchema.virtual("balance").get(function () {
    return this.cash + this.credit;
});
export const User = mongoose.model("users", userSchema);
