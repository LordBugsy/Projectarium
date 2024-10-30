import express from 'express';
import Comment from '../Models/Comment.js';
import Project from '../Models/Project.js';
import User from '../Models/User.js';

const router = express.Router();

// Create a comment
router.post('/create', async (req, res) => {
    try {
        const { projectID, userID, text, parentCommentID } = req.body;
        const project = await Project.findById(projectID);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newComment = new Comment({
            project: projectID,
            user: userID,
            text,
            likes: [userID], // The user who created the comment will automatically like it
            parentComment: parentCommentID
        });
        await newComment.save();

        project.comments.push(newComment._id);
        await project.save();

        res.status(201).json(newComment);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Like a comment
router.post('/like', async (req, res) => {
    try {
        const { commentID, userID } = req.body; // the comment's ID and the person who liked it
        const comment = await Comment.findById(commentID);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (comment.likes.includes(user._id)) {
            return res.status(200).json({ error: 'Comment already liked' });
        }

        comment.likes.push(user._id);
        await comment.save();

        res.status(200).json(comment);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Unlike a comment
router.post('/unlike', async (req, res) => {
    try {
        const { commentID, userID } = req.body;
        const comment = await Comment.findById(commentID);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!comment.likes.includes(user._id)) {
            return res.status(200).json({ error: 'Comment not liked' });
        }

        comment.likes = comment.likes.filter((id) => id.toString() !== user._id.toString());
        await comment.save();

        res.status(200).json(comment);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a comment
router.post('/delete', async (req, res) => {
    try {
        const { commentID, userID } = req.body;
        const comment = await Comment.findById(commentID);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (comment.user.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'You are not the owner of this comment' });
        }

        // Remove the comment from the project's comments array
        const project = await Project.findById(comment.project);
        project.comments = project.comments.filter((id) => id.toString() !== comment._id.toString());
        await project.save();

        await Comment.findByIdAndDelete(commentID);
        res.status(200).json({ message: 'Comment deleted successfully' });
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all comments of a project
router.get('/:projectID', async (req, res) => {
    try {
        const projectID = req.params.projectID;

        // Fetch the project and its comments
        const project = await Project.findById(projectID)
                                     .populate({
                                         path: 'comments',
                                         populate: { path: 'user', select: 'username profileColour' } // Populate the user field of the comments
                                     });

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.status(200).json(project.comments);
    } 
    
    catch (error) {
        console.error('Error fetching comments:', error);
        res.status(400).json({ error: error.message });
    }
});

export default router;