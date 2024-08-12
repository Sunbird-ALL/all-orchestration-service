import mongoose from "mongoose";

// Define the emis_lessons_master schema
const emis_lessons_master = new mongoose.Schema({
    lesson_master_id : {
        type: Number,
        required: true,
        index: true
    },
    lesson_id: {
        type: String,
        required: true
    }
});


// Create the emis_lessons_master model
const emisLessonsMaster = mongoose.model("emis_lessons_masters", emis_lessons_master);
export default emisLessonsMaster;
