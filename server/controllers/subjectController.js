const Subject = require('../models/Subject');

exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ user: req.user._id });
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createSubject = async (req, res) => {
    const subject = new Subject({ ...req.body, user: req.user._id });
    try {
        const newSubject = await subject.save();
        res.status(201).json(newSubject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.deleteSubject = async (req, res) => {
    try {
        const deletedSubject = await Subject.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!deletedSubject) return res.status(404).json({ message: 'Subject not found' });
        
        // Also delete tasks associated with this subject
        const Task = require('../models/Task');
        await Task.deleteMany({ subject: req.params.id, user: req.user._id });
        
        res.json({ message: 'Subject and associated tasks deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
