const Task = require('../models/Task');
const Activity = require('../models/Activity');

exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user._id });
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
        if (req.body.status === 'completed') {
            const existingActivity = await Activity.findOne({ taskId: updatedTask._id, type: 'task' });
            if (!existingActivity) {
                await Activity.create({
                    type: 'task',
                    taskId: updatedTask._id,
                    category: updatedTask.category,
                    user: req.user._id,
                    duration: 30 // Default 30 mins for a task completion
                });
            }
        } else if (req.body.status && req.body.status !== 'completed') {
            // Remove activity if task is unmarked as completed
            await Activity.findOneAndDelete({ taskId: updatedTask._id, type: 'task' });
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
        
        // Also delete associated activity
        await Activity.findOneAndDelete({ taskId: req.params.id, type: 'task' });
        
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
