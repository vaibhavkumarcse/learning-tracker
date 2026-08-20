const Goal = require('../models/Goal');
const Activity = require('../models/Activity');

exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user._id });
        res.json(goals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createGoal = async (req, res) => {
    try {
        const goal = new Goal({ ...req.body, user: req.user._id });
        const newGoal = await goal.save();
        res.status(201).json(newGoal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const updatedGoal = await Goal.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        
        if (!updatedGoal) return res.status(404).json({ message: 'Goal not found' });

        // Log activity if completed
        if (req.body.status === 'completed') {
            const existingActivity = await Activity.findOne({ goalId: updatedGoal._id, type: 'goal' });
            if (!existingActivity) {
                await Activity.create({
                    type: 'goal',
                    goalId: updatedGoal._id,
                    category: 'Goal Completion',
                    user: req.user._id,
                    duration: 60 // Default 60 mins for a goal completion
                });
            }
        } else if (req.body.status && req.body.status !== 'completed') {
            // Remove activity if goal is unmarked as completed
            await Activity.findOneAndDelete({ goalId: updatedGoal._id, type: 'goal' });
        }

        res.json(updatedGoal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const deletedGoal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!deletedGoal) return res.status(404).json({ message: 'Goal not found' });
        
        // Also delete associated activity
        await Activity.findOneAndDelete({ goalId: req.params.id, type: 'goal' });
        
        res.json({ message: 'Goal deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
