import mongoose from "mongoose";

const reportProjectSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    state: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

const reportUserSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    state: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

// Export each model with named exports
const ReportProject = mongoose.model('ReportProject', reportProjectSchema);
const ReportUser = mongoose.model('ReportUser', reportUserSchema);

export { ReportProject, ReportUser };