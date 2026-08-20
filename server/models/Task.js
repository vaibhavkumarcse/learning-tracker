const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['todo', 'in-progress', 'completed'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    category: { type: String, default: 'Study' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date },
    completedAt: { type: Date },
    resources: [{
        title: { type: String },
        type: { type: String, enum: ['youtube', 'article', 'course', 'other'], default: 'other' },
        url: { type: String }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
