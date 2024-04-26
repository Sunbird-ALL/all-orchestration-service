import mongoose from "mongoose";

// Define the User schema
const virtualIdSchema = new mongoose.Schema({
    userName : {
        type: String,
        required: true,
    },
    virtualId: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// Create pointer model
const virtualId = mongoose.model("virtualId", virtualIdSchema);
export default virtualId;


