const Goal = require('../models/Goal');

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
        res.json(updatedGoal);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const deletedGoal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!deletedGoal) return res.status(404).json({ message: 'Goal not found' });
        res.json({ message: 'Goal deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
