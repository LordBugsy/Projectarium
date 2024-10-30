import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    displayName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    description: { type: String, default: 'No description provided' },
    isVerified: { type: Boolean, default: false },
    credits: { type: Number, default: 0 },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    profileColour: Number,
    projectsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    projectsLiked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    privateChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followersMilestones: [{ type: Number }],
}, { timestamps: true });

export default mongoose.model('User', userSchema);