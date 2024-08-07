import mongoose from "mongoose";

const learnerai_learner_progress = new mongoose.Schema({
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


const learnerProgress = mongoose.model('learnerai_learner_progress', learnerai_learner_progress);

export default learnerProgress;