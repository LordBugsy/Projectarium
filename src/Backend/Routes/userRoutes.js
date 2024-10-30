import express from 'express';
import bcrypt from 'bcrypt';
import Comment from '../Models/Comment.js';
import ChatLogs from '../Models/ChatLogs.js';
import Project from '../Models/Project.js';
import mongoose from 'mongoose';
import User from '../Models/User.js';

const router = express.Router();

const createBotUser = async () => {
    // Generate a random password for the bot user, this password will have a length of 16 characters
    // We use a random password because the bot user will not be able to login, it will only be used to create projects and send messages
    const randomPassword = Math.random().toString(36).slice(-16);

    try {
        // Check if the bot user already exists
        const bot = await User.findOne({ username: 'ProjectariumBot' });
        if (bot) {
            return;
        }

        const botUser = new User({
            username: 'ProjectariumBot',
            displayName: 'Projectarium Bot',
            password: await bcrypt.hash(randomPassword, 10),
            description: 'Welecome to Projectarium! I am a bot created by LordBugsy to help you get started with the platform!',
            profileColour: 8,
            projectsCreated: [],
            projectsLiked: [],
            role: 'admin',
            isVerified: true,
            credits: 0,
            privateChats: [],
            followers: [],
            following: [],
            followersMilestones: [],
        });

        await botUser.save();

        // Create some projects for the bot user
        const projects = [
            {
                name: 'Discasery',
                description: "LordBugsy's first ever project!",
                owner: botUser._id,
                link: 'https://github.com/LordBugsy/Discasery',
                status: 'sponsored',
            }, {
                name: 'ReactTalk',
                description: 'A chat application made with React and MongoDB!',
                owner: botUser._id,
                link: 'https://github.com/LordBugsy/ReactTalk',
                status: 'sponsored',
            }, {
                name: 'Projectarium',
                description: 'A project sharing platform made with React, Node.js, and MongoDB!',
                owner: botUser._id,
                link: 'https://github.com/LordBugsy/Projectarium',
                status: 'sponsored',
        }];

        for (const project of projects) {
            const newProject = new Project(project);
            await newProject.save();

            botUser.projectsCreated.push(newProject._id);
            await botUser.save();
        }
    }

    catch (error) {
        console.error('Error creating bot user:', error);
    }
}
createBotUser();

// Make the bot user send a welcoming message to every new user
const sendWelcomeMessage = async (userID) => {
    try {
        const bot = await User.findOne({ username: 'ProjectariumBot' });
        const user = await User.findById(userID);

        if (!bot || !user) {
            return;
        }

        const chat = new ChatLogs({
            groupChat: [bot._id, user._id],
            messages: [
                { sender: bot._id, text: 'Welcome to Projectarium! In Projectarium, you can create a project and share it with the community! The entire website (Frontend and Backend) was made by LordBugsy (@LordBugsy on GitHub)!' }
            ],
        });

        await chat.save();

        user.privateChats.push(bot._id);
        await user.save();
    }

    catch (error) {
        console.error('Error sending welcome message:', error);
    }
}

// Make the bot follow every new user
const makeBotFollowUser = async (userID) => {
    try {
        const bot = await User.findOne({ username: 'ProjectariumBot' });
        const user = await User.findById(userID);

        if (!bot || !user) {
            return;
        }

        bot.following.push(user._id);
        await bot.save();

        user.followers.push(bot._id);
        await user.save();
    }

    catch (error) {
        console.error('Error making bot follow user:', error);
    }
}

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { username, password, displayName } = req.body;
        if (!username || !password || !displayName) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            username,
            displayName,
            password: hashedPassword,
            profileColour: username === "LordBugsy" ? 0 : Math.ceil(Math.random() * 7),
            role: username === "LordBugsy" ? 'admin' : 'user', // LordBugsy and ProjectariumBot are admins
            isVerified: username === "LordBugsy" ? true : false,
            projectsCreated: [],
            projectsLiked: []
        });

        await newUser.save();
        sendWelcomeMessage(newUser._id);
        makeBotFollowUser(newUser._id);

        res.status(201).json({
            _id: newUser._id,
            username: newUser.username,
            displayName: newUser.displayName,
            description: newUser.description,
            profileColour: newUser.profileColour,
            projectsCreated: newUser.projectsCreated,
            projectsLiked: newUser.projectsLiked,
            role: newUser.role,
            isVerified: newUser.isVerified,
            credits: newUser.credits,
        });
    } catch (error) {
        console.error('Error during signup:', error);
        if (error.code === 11000 && error.keyValue && error.keyValue.username) {
            return res.status(400).json({ error: 'Username is already taken' });
        }
        return res.status(400).json({ error: 'An error occurred during signup', details: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                res.status(200).json({
                    _id: user._id,
                    username: user.username,
                    displayName: user.displayName,
                    description: user.description,
                    profileColour: user.profileColour,
                    projectsCreated: user.projectsCreated,
                    projectsLiked: user.projectsLiked,
                    role: user.role,
                    isVerified: user.isVerified,
                    credits: user.credits,
                });
            } else {
                res.status(400).json({ error: 'Invalid username or password' });
            }
        } else {
            res.status(400).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a user
router.post('/delete', async (req, res) => {
    // Sessions and transactions are used to ensure that all operations are successful before committing the transaction
    // If an error occurs, the transaction will be aborted and the changes will be rolled back
    // Without transactions, if an error occurs, the database could be left in an inconsistent state, hence why these are used

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { userID } = req.body;

        const user = await User.findById(userID);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove the user from the followers and following arrays of other users
        await User.updateMany({ $or: [{ followers: userID }, { following: userID }] }, { $pull: { followers: userID, following: userID } }, { session });

        // Delete the comments made by the user
        await Comment.deleteMany({ user: userID }, { session });

        // Remove the user from every comments likes array
        await Comment.updateMany({ likes: userID }, { $pull: { likes: userID } }, { session });

        // Delete the user from the private chats of other users
        await User.updateMany({ privateChats: userID }, { $pull: { privateChats: userID } }, { session });

        // Delete every comments that were under one of the user's projects
        await Comment.deleteMany({ project: { $in: user.projectsCreated } }, { session });

        // Delete every chat log that the user is in
        await ChatLogs.deleteMany({ groupChat: userID }, { session });

        // Delete the projects created by the user
        await Project.deleteMany({ owner: userID }, { session });

        // Remove the user from projects they liked
        await Project.updateMany({ likes: userID }, { $pull: { likes: userID } }, { session });

        // Delete the user
        await User.deleteOne({ _id: userID }, { session });

        // Commit the transaction if all operations are successful
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'User deleted successfully' });
    } 
    
    catch (error) {
        // Abort the transaction in case of an error
        await session.abortTransaction();
        session.endSession();
        console.error('Error deleting user:', error);
        res.status(400).json({ error: error.message });
    }
});

// Change password route
router.post('/edit/password', async (req, res) => {
    try {
        const { userID, currentPassword, newPassword } = req.body;
        const user = await User.findById(userID);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);

        if (passwordMatch) {
            // Hash the new password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            user.password = hashedPassword;
            await user.save();


            res.status(200).json({ message: 'Password changed successfully' });
        }

        else {
            res.status(200).json({ error: 'Invalid password' });
        }
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Edit a user's display name
router.post('/edit/displayname', async (req, res) => {
    try {
        const { userID, newValue } = req.body;
        const user = await User.findById(userID).select('username displayName description credits profileColour _id role');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.displayName = newValue;
        await user.save();

        res.status(200).json(user);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Edit a user's description
router.post('/edit/description', async (req, res) => {
    try {
        const { userID, newValue } = req.body;
        const user = await User.findById(userID).select('username displayName description credits profileColour _id role');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.description = newValue;
        await user.save();
        
        res.status(200).json(user);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Edit a user's username (can only be done with credits)
router.post('/edit/username', async (req, res) => {
    try {
        const { userID, newValue } = req.body;
        const user = await User.findById(userID).select('username displayName description credits profileColour _id role');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the username is already taken
        const usernameExists = await User.findOne({ username: newValue });
        if (usernameExists) {
            return res.status(200).json({ 
                error: 'Username is already taken',
                usernameAlreadyExists: true
            });
        }

        if (user.credits < 100) {
            return res.status(403).json({ error: 'Not enough credits' });
        }

        user.credits -= 100;
        user.username = newValue;
        await user.save();

        res.status(200).json(user);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add credits to a user
router.post('/credits/add', async (req, res) => {
    try {
        const { userID, amount } = req.body;
        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.credits += amount;
        await user.save();
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a user by their username
router.get('/:username', async (req, res) => {
    try {
        // Find the user by username and populate the projectsCreated field
        const user = await User.findOne({ username: req.params.username }).populate('projectsCreated', 'name');

        if (user) {
            res.status(200).json({
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                description: user.description,
                profileColour: user.profileColour,
                projectsCreated: user.projectsCreated,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                followers: user.followers,
                following: user.following
            });
        } 
        
        else {
            res.status(404).json({ error: 'User not found' });
        }
    } 
    
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a user by their ID
router.get('/details/:userID', async (req, res) => {
    try {
        const user = await User.findById(req.params.userID).select('username displayName description credits');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Follow a user
router.post('/follow', async (req, res) => {
    try {
        const { userID, userToFollowID } = req.body;
        const user = await User.findById(userID);
        const userToFollow = await User.findById(userToFollowID);

        if (!user || !userToFollow) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.following.includes(userToFollowID)) {
            return res.status(200).json({ error: 'User already followed' });
        }

        user.following.push(userToFollowID);
        await user.save();

        userToFollow.followers.push(userID);

        if (userToFollow.followers % 30 === 0 && !userToFollow.followersMilestones.includes(userToFollow.followers)) {
            userToFollow.followersMilestones.push(userToFollow.followers);
            userToFollow.credits += 100;
        }
        await userToFollow.save();

        res.status(200).json(user);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Unfollow a user
router.post('/unfollow', async (req, res) => {
    try {
        const { userID, userToUnfollowID } = req.body;
        const user = await User.findById(userID);
        const userToUnfollow = await User.findById(userToUnfollowID);

        if (!user || !userToUnfollow) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.following.includes(userToUnfollowID)) {
            return res.status(200).json({ error: 'User not followed' });
        }

        user.following = user.following.filter((id) => id.toString() !== userToUnfollowID);
        await user.save();

        userToUnfollow.followers = userToUnfollow.followers.filter((id) => id.toString() !== userID);
        await userToUnfollow.save();

        res.status(200).json(user);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// List all users that a user is following
router.get('/following/:userID', async (req, res) => {
    try {
        const user = await User.findById(req.params.userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const following = await User.find({ _id: { $in: user.following } }).select('username displayName profileColour isVerified');

        res.status(200).json(following);
    } 
    
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// List all users that are following that said user
router.get('/followers/:userID', async (req, res) => {
    try {
        const user = await User.findById(req.params.userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const followers = await User.find({ _id: { $in: user.followers } }).select('username displayName profileColour isVerified');

        res.status(200).json(followers);
    } 
    
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Check if two users are following each other
router.get('/following/:userID/:userToCheckID', async (req, res) => {
    try {
        const user = await User.findById(req.params.userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userToCheck = await User.findById(req.params.userToCheckID);
        if (!userToCheck) {
            return res.status(404).json({ error: 'User to check not found' });
        }

        res.status(200).json({ following: user.following.includes(userToCheck._id) });
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});


export default router;
