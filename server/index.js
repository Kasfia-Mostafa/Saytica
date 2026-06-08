const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { sanitizeModels, sanitizeTasks } = require('./utils/sanitize');
const createModelsRouter = require('./routes/models');
const createTasksRouter = require('./routes/tasks');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Load raw data from server directory
const modelsPath = path.join(__dirname, 'models.json');
const tasksPath = path.join(__dirname, 'tasks.json');

const rawModels = JSON.parse(fs.readFileSync(modelsPath, 'utf-8'));
const rawTasks = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));

// Sanitize data on startup
const models = sanitizeModels(rawModels);
const tasks = sanitizeTasks(rawTasks);

console.log(`Loaded ${models.length} models and ${tasks.length} tasks`);

// Mount API routes
app.use('/api/models', createModelsRouter(models));
app.use('/api/tasks', createTasksRouter(tasks, tasksPath));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Saytica API server running on http://localhost:${PORT}`);
});
