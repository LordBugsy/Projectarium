import mongoose from 'mongoose';

const chatLogs = new mongoose.Schema({
    state: { type: String, enum: ['unread', 'read'], default: 'unread' },
    groupChat: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    messages: [{
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
    }],
}, { timestamps: true });

export default mongoose.model('ChatLogs', chatLogs);