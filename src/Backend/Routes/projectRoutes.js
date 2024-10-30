import express from 'express';
import Project from '../Models/Project.js';
import User from '../Models/User.js';
import Comment from '../Models/Comment.js';

const router = express.Router();

// Create a new project
router.post('/create', async (req, res) => {
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
router.post('/sponsor', async (req, res) => {
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

// Get random projects
router.get('/random', async (req, res) => {
    try {
        const projects = await Project.aggregate([{ $sample: { size: 10 } }]);
        const populatedProjects = await Project.populate(projects, { path: 'owner', select: 'username' });
    
        res.status(200).json(populatedProjects);
    } 
    
    catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching projects.' });
    }
    
});

// Get popular projects (based on likes)
router.get('/popular', async (req, res) => {
    try {
        const projects = await Project.find().sort({ likes: -1 }).limit(10).populate('owner', 'username');
        res.status(200).json(projects);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all sponsored projects
router.get('/sponsored', async (req, res) => {
    try {
        const projects = await Project.find({ status: 'sponsored' }).populate('owner', 'username');
        res.status(200).json(projects);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Like a project
router.post('/like', async (req, res) => {
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
router.post('/unlike', async (req, res) => {
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

// Delete a project
router.post('/delete', async (req, res) => {
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
router.post('/update', async (req, res) => {
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

// Get 7 projects created by a user's id
router.get('/:userID', async (req, res) => {
    try {
        const user = await User.findById(req.params.userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const projects = await Project.find({ owner: user._id }).populate('owner', 'username').limit(7);
        res.status(200).json(projects);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a project by a query
router.get('/search/:query', async (req, res) => {
    try {
        const projects = await Project.find({ name: { $regex: encodeURIComponent(req.params.query), $options: 'i' }}).populate('owner', 'username isVerified');
        res.status(200).json(projects);
    }

    catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all projects made by a user
router.get('/user/:username', async (req, res) => {
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

// Check if a project is liked by a user
router.get('/liked/:projectID/:userID', async (req, res) => {
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


// Get the details of a project by its owner's username and project name
router.get('/:username/:project', async (req, res) => {
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

export default router;