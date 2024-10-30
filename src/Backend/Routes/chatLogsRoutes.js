import express from 'express';
import ChatLogs from '../Models/ChatLogs.js';
import User from '../Models/User.js';

const router = express.Router();

// Create a chat log
router.post('/open', async (req, res) => {
    try {
        const { senderID, receiverID } = req.body;

        const sender = await User.findById(senderID);
        const receiver = await User.findById(receiverID);

        if (!sender || !receiver) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if both users follow each other
        if (!sender.following.includes(receiverID) || !receiver.following.includes(senderID)) {
            return res.status(403).json({ mutualFollow: false });
        }

        // Find an existing chat log between both users
        let message = await ChatLogs.findOne({
            groupChat: { $all: [senderID, receiverID] }
        });

        // If no chat log exists, create a new one
        if (!message) {
            message = new ChatLogs({
                groupChat: [senderID, receiverID],
            });
            await message.save();
        }

        // Return the message with the groupChat
        res.status(200).json({
            message,
            senderChatIndex: sender.privateChats.indexOf(receiverID),
            receiverChatIndex: receiver.privateChats.indexOf(senderID),
        });

    } 
    
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// List all private messages of a user
router.get('/:userID', async (req, res) => {
    try {
        const user = await User.findById(req.params.userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const chatLog = await ChatLogs.find({ groupChat: user._id }).populate('groupChat', 'username profileColour');
        res.status(200).json(chatLog);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Send a message in a chat log
router.post('/send/:groupChatID', async (req, res) => {
    try {
        const { message, sender } = req.body;
        const chatLog = await ChatLogs.findById(req.params.groupChatID).populate('groupChat', 'username');

        if (!chatLog) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        chatLog.messages.push({
            sender,
            text: message,
        });

        await chatLog.save();
        res.status(200).json(chatLog);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// List the chat logs of a groupchat
router.get('/groupChat/:groupChatID', async (req, res) => {
    try {
        const chatLog = await ChatLogs.findById(req.params.groupChatID).populate('messages.sender', 'username profileColour');
        if (!chatLog) {
            return res.status(404).json({ error: 'Chat not found' });
        }

        res.status(200).json(chatLog);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;