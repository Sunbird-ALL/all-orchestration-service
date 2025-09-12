import mongoose from "mongoose";

const username = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const student = mongoose.model("username", username);
export default student;