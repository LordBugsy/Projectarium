import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './Routes/userRoutes.js';
import projectRoutes from './Routes/projectRoutes.js';
import reportRoutes from './Routes/reportRoutes.js';
import chatLogsRoutes from './Routes/chatLogsRoutes.js';
import commentRoutes from './Routes/commentRoutes.js';

// Simulate __dirname in ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the .env file (.env and server.js are in the same directory)
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

app.use('/api/user', userRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/chatlogs', chatLogsRoutes);
app.use('/api/comment', commentRoutes);

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (_req, res) => {
    console.error(`You've reached a route that doesn't exist. You entered: ${_req.originalUrl} via ${_req.method} method.`);
    res.json({ error: 'This route does not exist' });
});

// Start the server
const PORT = process.env.PORT || 5172; // localhost:5172. We're using this port because 5173 is used by the React app (using it for the API would cause a conflict)
app.listen(PORT, () => console.log(`Server is running on port ${PORT} 🚀`));