import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

// First of all, sorry for the long file, but I wanted to make sure that I covered as much as possible. For my future projects,
// I will be splitting the routes into separate files to make it easier to manage.

// This file is the entry point for the backend server. It will be used to handle all the API routes 
// and interact with the database. For my projects, I use MongoDB because it is, in my opinion, the easiest one to use and set up. 
// The server will be running on localhost:5172, and the frontend will be running on localhost:5173. The server will be serving the 
// frontend files from the build folder, which will be created when you run the build command in the frontend folder. The server will also 
// be using the .env file to load environment variables. The server will be using Express to handle the API routes, Mongoose to interact
// with the MongoDB database, and bcrypt to hash passwords. If you want to use another database, you can use the one you like, however,
// take into consideration that you will have to change the code to interact with the database.

// Simulate __dirname in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the .env file
const envPath = path.resolve(__dirname, '.env');

// Load environment variables from .env file
dotenv.config({ path: envPath });

const app = express(); // Setup the express server

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schemas
const userSchema = new mongoose.Schema({
    displayName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    description: { type: String, default: 'No description provided' },
    isVerified: { type: Boolean, default: false },
    credits: { type: Number, default: 0 }, // Credits will be used to sponsor projects
    role: { type: String, enum: ['admin', 'user'], default: 'user' }, // Setting an "admin" role for a user should ONLY be done manually in the database, hence why no route is provided for it
    profileColour: Number,
    projectsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    projectsLiked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    privateChats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // List of users they've chatted with
    followersMilestones: [{ type: Number }], // If a user reaches a certain amount of followers, they will receive a certain amount of credits
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    thumbnail: String,
    link: String,
    creationDate: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    status: { type: String, enum: ['sponsored', 'public'], default: 'public' },
    likesMilestones: [{ type: Number }], // If a project reaches a certain amount of likes, the owner will receive a certain amount of credits
}, { timestamps: true });


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

const reportUserSchema = new mongoose.Schema({
    user: { // The user that is being reported
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    state: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });
    
const reportProjectSchema = new mongoose.Schema({
    project: { // The project that is being reported
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    state: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });


// Models
const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Comment = mongoose.model('Comment', commentsSchema);
const ChatLogs = mongoose.model('ChatLogs', chatLogs);
const ReportUser = mongoose.model('ReportUser', reportUserSchema);
const ReportProject = mongoose.model('ReportProject', reportProjectSchema);


// Routes

// User routes
// Create a bot user
const createBotUser = async () => {
    try {
        // Check if the bot user already exists
        const bot = await User.findOne({ username: 'ProjectariumBot' });
        if (bot) {
            return;
        }

        const botUser = new User({
            username: 'ProjectariumBot',
            displayName: 'Projectarium Bot',
            password: await bcrypt.hash('projectariumbot', 10),
            description: 'Welecome to Projectarium! I am a bot created by LordBugsy to help you get started with the platform!',
            profileColour: 8,
            projectsCreated: [],
            projectsLiked: [],
            role: 'user',
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

// Create a new user
app.post('/api/signup', async (req, res) => {
    try {
        const { username, password, displayName } = req.body;

        // Check if all fields are present
        if (!username || !password || !displayName) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create a new user
        const newUser = new User({
            username,
            displayName,
            password: hashedPassword,
            profileColour: username === "LordBugsy" ? 0 : Math.ceil(Math.random() * 7),
            isVerified: username === "LordBugsy" ? true : false,
            projectsCreated: [],
            projectsLiked: []
        });

        // Save the new user
        await newUser.save();

        // Send a welcoming message from the bot
        sendWelcomeMessage(newUser._id);

        // Make the bot follow the new user
        makeBotFollowUser(newUser._id);

        // Respond with the user details (excluding sensitive information like password)
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
    } 
    
    catch (error) {
        console.error('Error occurred during signup:', error);
    
        // Check specifically for duplicate key error (E11000) on the username
        if (error.code === 11000 && error.keyValue && error.keyValue.username) {
            return res.status(400).json({ error: 'Username is already taken' });
        }
    
        // Handle other errors
        return res.status(400).json({ error: 'An error occurred during signup', details: error.message });
    }
});

// Login a user
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username }); 

        if (user) {
            // Compare the provided password with the hashed password in the database
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
            } 
            
            else {
                res.status(400).json({ error: 'Invalid username or password' });
            }
        } 
        
        else {
            res.status(400).json({ error: 'Invalid username or password' });
        }
    } 
    
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a user
app.post('/api/user/delete', async (req, res) => {
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

// Change a user's password
app.post('/api/user/edit/password', async (req, res) => {
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

// Add credits to a user
app.post('/api/user/credits/add', async (req, res) => {
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

// Get the infos of a user by their username
app.get('/api/user/:username', async (req, res) => {
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

// Load the username, displayName and description of a user by their ID
app.get('/api/userdetails/:userID', async (req, res) => {
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

// Edit a user's display name
app.post('/api/user/edit/displayname', async (req, res) => {
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
app.post('/api/user/edit/description', async (req, res) => {
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
app.post('/api/user/edit/username', async (req, res) => {
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

// Follow a user
app.post('/api/user/follow', async (req, res) => {
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
app.post('/api/user/unfollow', async (req, res) => {
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
app.get('/api/user/following/:userID', async (req, res) => {
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
app.get('/api/user/followers/:userID', async (req, res) => {
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
app.get('/api/user/following/:userID/:userToCheckID', async (req, res) => {
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


// Project routes
// Create a new project
app.post('/api/create', async (req, res) => {
    try {
        const { link, name, description, ownerID } = req.body;

        const user = await User.findById(ownerID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the owner already has a project with the same name
        const projectWithSameName = await Project.findOne({ owner: ownerID, name });
        if (projectWithSameName) {
            return res.status(400).json({ alreadyExists: 'You have already created a project with this name.' });
        }

        const newProject = new Project({
            link,
            name,
            description,
            owner: ownerID
        });
        await newProject.save();

        await User.findByIdAndUpdate(
            ownerID,
            { $push: { projectsCreated: newProject._id } },
            { new: true } 
        );

        res.status(201).json(newProject);
    } 

    catch (error) {
        console.error('Error occurred during project creation:', error);
        res.status(400).json({ error: error.message });
    }
});

// Sponsor a project
app.post('/api/project/sponsor', async (req, res) => {
    try {
        const { projectID, userID } = req.body;
        const project = await Project.findById(projectID);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.credits < 1200) {
            return res.status(200).json({ error: 'Not enough credits' });
        }

        user.credits -= 1200;
        await user.save();

        project.status = 'sponsored';
        await project.save();

        res.status(200).json(project);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get the infos of a project by who created it and the project's name
app.get('/api/project/:username/:project', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const project = await Project.findOne({ owner: user._id, name: req.params.project }).populate('owner', 'username isVerified'); 

        if (project) {
            res.status(200).json(project);
        } 
        
        else {
            res.status(404).json({ error: 'Project not found' });
        }
    } 
    
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get 10 random projects
app.get('/api/random/projects', async (req, res) => {
    try {
        const projects = await Project.aggregate([{ $sample: { size: 10 } }]);
        const populatedProjects = await Project.populate(projects, { path: 'owner', select: 'username' });
    
        res.status(200).json(populatedProjects);
    } 
    
    catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching projects.' });
    }
    
});

// Get 10 projects that are sponsored (if any, if there arent, then the section in the frontend will be removed)
app.get('/api/projects/sponsored', async (req, res) => {
    try {
        const projects = await Project.find({ status: "sponsored" }).limit(10).populate('owner', 'username');
        res.status(200).json(projects);
    }

    catch (error) {
        console.error('Error in /api/projects/sponsored:', error)
        res.status(400).json({ error: error.message });
    }
});


// Get 10 projects that are the most popular (decreasing order of likes)
app.get('/api/projects/popular', async (req, res) => {
    try {
        const projects = await Project.find().sort({ likes: -1 }).limit(10).populate('owner', 'username');
        res.status(200).json(projects);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get 7 projects created by a user's id
app.get('/api/projects/:userID', async (req, res) => {
    try {
        const user = await User.findById(req.params.userID).limit(7);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const projects = await Project.find({ owner: user._id }).populate('owner', 'username');
        res.status(200).json(projects);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get ALL projects according to a query
app.get('/api/projects/search/:query', async (req, res) => {
    try {
        const projects = await Project.find({ name: { $regex: encodeURIComponent(req.params.query), $options: 'i' }}).populate('owner', 'username isVerified');
        res.status(200).json(projects);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all the projects made by a user
app.get('/api/projects/user/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const projects = await Project.find({ owner: user._id }).populate('owner', 'username');
        res.status(200).json(projects);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all sponsored projects
app.get('/api/projects/sponsored', async (req, res) => {
    try {
        const projects = await Project.find({ status: 'sponsored' }).populate('owner', 'username');
        res.status(200).json(projects);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Like a project
app.post('/api/project/like', async (req, res) => {
    try {
        const { projectID, userID } = req.body;
        const project = await Project.findById(projectID);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (project.likes.includes(user._id)) {
            return res.status(200).json({ error: 'Project already liked' }); 
        }

        project.likes.push(user._id);

        if (project.likes.length % 15 === 0 && !project.likesMilestones.includes(project.likes.length)) {
            project.likesMilestones.push(project.likes.length);
            const owner = await User.findById(project.owner);
            owner.credits += 5;
            await owner.save();
        }
        await project.save();

        user.projectsLiked.push(project._id);
        await user.save();

        res.status(200).json(project);
    }
    
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Unlike a project
app.post('/api/project/unlike', async (req, res) => {
    try {
        const { projectID, userID } = req.body;
        const project = await Project.findById(projectID);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!project.likes.includes(user._id)) {
            return res.status(200).json({ error: 'Project not liked' });
        }

        user.projectsLiked = user.projectsLiked.filter((id) => id.toString() !== project._id.toString());
        await user.save();

        project.likes = project.likes.filter((id) => id.toString() !== user._id.toString());
        await project.save();

        res.status(200).json(project);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Check if a project is liked by a user
app.get('/api/project/liked/:projectID/:userID', async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectID);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const user = await User.findById(req.params.userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ liked: project.likes.includes(user._id) });
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a project
app.post('/api/project/delete', async (req, res) => {
    try {
        const { projectID, userID } = req.body;
        const project = await Project.findById(projectID);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (project.owner.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'You are not the owner of this project' });
        }
        
        // Remove the project from the user's projectsCreated array
        user.projectsCreated = user.projectsCreated.filter((id) => id.toString() !== project._id.toString());
        await user.save();

        // Remove the project from every user's projectsLiked array
        const users = await User.find({ projectsLiked: project._id });
        for (const user of users) {
            user.projectsLiked = user.projectsLiked.filter((id) => id.toString() !== project._id.toString());
            await user.save();
        }

        // Remove the project from every comment's project field
        await Comment.deleteMany({ project: project._id });


        // Delete the project
        await Project.findByIdAndDelete(projectID);
        res.status(200).json({ message: 'Project deleted successfully' });

    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a project
app.post('/api/project/update', async (req, res) => {
    try {
        const { projectID, userID, name, description, link } = req.body;
        const project = await Project.findById(projectID);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const user = await User.findById(userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (project.owner.toString() !== user._id.toString()) {
            return res.status(403).json({ error: 'You are not the owner of this project' });
        }

        project.name = name;
        project.description = description;
        project.link = link;
        await project.save();

        res.status(200).json(project);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Comment routes
// Create a new comment
app.post('/api/comment/create', async (req, res) => {
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

// Get all comments of a project
app.get('/api/comments/:projectID', async (req, res) => {
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

// Like a comment
app.post('/api/comment/like', async (req, res) => {
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
app.post('/api/comment/unlike', async (req, res) => {
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
app.post('/api/comment/delete', async (req, res) => {
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


// Private message routes
// Open/Start a private message with a user
app.post('/api/message/open', async (req, res) => {
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

// Send a private message
app.post('/api/message/send', async (req, res) => {
    try {
        const { senderID, receiverID, text } = req.body;
        const sender = await User.findById(senderID);
        const receiver = await User.findById(receiverID);

        if (!sender || !receiver) {
            return res.status(404).json({ error: 'User not found' });
        }

        const chatLogs = new ChatLogs({
            groupChat: [senderID, receiverID],
        });

        await chatLogs.save();
        res.status(201).json(chatLogs);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// List all private messages of a user
app.get('/api/messages/:userID', async (req, res) => {
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

// List the chat logs of a groupchat
app.get('/api/chatlogs/:groupChatID', async (req, res) => {
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

// Send a private message to a group chat
app.post('/api/sendindm/:groupChatID', async (req, res) => {
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


// Report routes
// Report a user
app.post('/api/report/user', async (req, res) => {
    try {
        const { userID, reason, description } = req.body;
        const user = await User.findById(userID);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const report = new ReportUser({
            user: userID,
            reason,
            description,
        });

        await report.save();
        res.status(201).json(report);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Report a project
app.post('/api/report/project', async (req, res) => {
    try {
        const { projectID, reason, description } = req.body;
        const project = await Project.findById(projectID);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const report = new ReportProject({
            project: projectID,
            reason,
            description,
        });

        await report.save();
        res.status(201).json(report);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Routes that might be implemented in the future
/*
- gift credits to a user
- edit a project (name, description, link)
*/


// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Handle any requests that don't match the API routes.
app.get('*', (_req, res) => {
    console.error("You have entered a route that doesn't exist.");
    res.json({ error: 'This route does not exist' });
});

// Start the server
const PORT = process.env.PORT || 5172; // localhost:5172. We're using this port because 5173 is used by the React app (using it for the API would cause a conflict)
app.listen(PORT, () => console.log(`Server is running on port ${PORT} 🚀`));