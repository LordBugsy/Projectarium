import express from 'express';
import Project from '../Models/Project.js';
import { ReportProject, ReportUser } from '../Models/Report.js';
import User from '../Models/User.js';

const router = express.Router();

router.post('/user', async (req, res) => {
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

router.post('/project', async (req, res) => {
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

export default router;