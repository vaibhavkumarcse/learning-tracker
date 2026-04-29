const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Streak', streakSchema);
