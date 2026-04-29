const Activity = require('../models/Activity');
const Streak = require('../models/Streak');

exports.getStats = async (req, res) => {
    try {
        const activities = await Activity.find({ user: req.user._id }).populate('subject');
        // Simple streak calculation logic could go here or in a separate hook
        const streak = await Streak.findOne({ user: req.user._id });
        res.json({ activities, streak });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.logActivity = async (req, res) => {
    try {
        const activity = new Activity({ ...req.body, user: req.user._id });
        await activity.save();
        
        // Update streak
        const today = new Date().setHours(0,0,0,0);
        let streak = await Streak.findOne({ user: req.user._id });
        
        if (!streak) {
            streak = new Streak({ user: req.user._id, currentStreak: 1, lastActivityDate: new Date() });
        } else {
            const lastDate = new Date(streak.lastActivityDate).setHours(0,0,0,0);
            const diff = (today - lastDate) / (1000 * 60 * 60 * 24);
            
            if (diff === 1) {
                streak.currentStreak += 1;
            } else if (diff > 1) {
                streak.currentStreak = 1;
            }
            streak.lastActivityDate = new Date();
            if (streak.currentStreak > streak.longestStreak) {
                streak.longestStreak = streak.currentStreak;
            }
        }
        await streak.save();
        
        res.status(201).json({ activity, streak });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
