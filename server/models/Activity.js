const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now, required: true },
    type: { type: String, enum: ['task', 'pomodoro', 'study_log'], required: true },
    duration: { type: Number, default: 0 }, // minutes
    category: { type: String, default: 'Study' },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    notes: { type: String },
    topicsCovered: [{ type: String }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
