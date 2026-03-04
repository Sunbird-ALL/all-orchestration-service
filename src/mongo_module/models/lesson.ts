import mongoose from "mongoose";

// Define the User schema
const learnerai_lesson_tracking = new mongoose.Schema({
    userId : {
        type: String,
        required: true,
    },
    sessionId: {
        type: String,
        required: true,
    },
    milestone: {
        type: String,
        required: true,
    },
    milestoneLevel: {
        type: String,
        required: false,
    },
    subMilestoneLevel: {
         type: String,
        required: false,
    },
    language: {
        type: String,
        required: true,
    },
    lesson: {
        type: String,
        required: true,
    },
    progress: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number,
        required: false,
    },
    applyLevel: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

learnerai_lesson_tracking.index({ userId: 1, language: 1, createdAt: -1 });

// Create the Lesson model
const Lesson = mongoose.model("learnerai_lesson_tracking", learnerai_lesson_tracking);
export default Lesson;
