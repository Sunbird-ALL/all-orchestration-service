import mongoose from "mongoose";

const learnerProgressSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    subSessionId: {
        type: String,
        required: true
    },
    milestoneLevel: {
        type: String,
        required: true
    },
    language: {
        type: String,
        required: true
    }
},
{
    timestamps: true,
    collection: 'learnerProgress'
});


const learnerProgress = mongoose.model('learnerProgress', learnerProgressSchema);

export default learnerProgress;