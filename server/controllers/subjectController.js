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
