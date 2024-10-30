import mongoose from 'mongoose';

const commentsSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Comments will be ordered by the amount of likes
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // Nested comments to make threads of comments
}, { timestamps: true });

export default mongoose.model('Comment', commentsSchema);