import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    thumbnail: String,
    link: String,
    creationDate: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    status: { type: String, enum: ['sponsored', 'public'], default: 'public' },
    likesMilestones: [{ type: Number }],
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);