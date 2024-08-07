import mongoose from "mongoose";

// Define the User schema
const learnerai_virtual_id = new mongoose.Schema({
    userName : {
        type: String,
        required: true,
        index: true
    },
    virtualId: {
        type: Number,
        required: true,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// Create pointer model
const virtualId = mongoose.model("learnerai_virtual_id", learnerai_virtual_id);
export default virtualId;


