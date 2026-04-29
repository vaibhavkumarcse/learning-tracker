const Task = require('../models/Task');
const Activity = require('../models/Activity');

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id }).populate('subject');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createTask = async (req, res) => {
    const task = new Task({ ...req.body, user: req.user._id });
    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true }
        );
        
        if (!updatedTask) return res.status(404).json({ message: 'Task not found' });

        // Log activity if completed
        if (req.body.status === 'completed' && updatedTask.status === 'completed') {
            await Activity.create({
                type: 'task',
                taskId: updatedTask._id,
                subject: updatedTask.subject,
                user: req.user._id,
                duration: 30 // Default 30 mins for a task completion, adjust as needed
            });
        }
        
        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
