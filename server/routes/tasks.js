const express = require('express');
const router = express.Router();
const fs = require('fs');

const VALID_STATUSES = ['pending', 'in_progress', 'done'];

// Valid forward transitions only
const TRANSITIONS = {
  pending: 'in_progress',
  in_progress: 'done',
};

/**
 * Task routes factory.
 * Receives the sanitized in-memory tasks array and the file path for persistence.
 */
module.exports = function createTasksRouter(tasks, tasksFilePath) {
  // GET /api/tasks — returns tasks, optionally filtered by assignedTo or projectId
  router.get('/', (req, res) => {
    let result = [...tasks];

    const { assignedTo, projectId } = req.query;

    if (assignedTo) {
      result = result.filter((t) => t.assignedTo === assignedTo);
    }

    if (projectId) {
      result = result.filter((t) => t.projectId === projectId);
    }

    res.json(result);
  });

  // PATCH /api/tasks/:id — advance a task's status
  router.patch('/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Find task
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Validate status value
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    // Validate transition
    const task = tasks[taskIndex];
    const expectedNext = TRANSITIONS[task.status];

    if (status !== expectedNext && status !== task.status) {
      return res.status(400).json({
        error: `Invalid transition: ${task.status} → ${status}. Expected: ${task.status} → ${expectedNext || '(terminal state)'}`,
      });
    }

    // Update in memory
    tasks[taskIndex] = { ...task, status };

    // Persist to disk
    try {
      const rawTasks = tasks.map((t) => ({
        id: t.id,
        title: t.title,
        projectId: t.projectId,
        projectName: t.projectName,
        clientId: t.clientId,
        assignedTo: t.assignedTo,
        status: t.status,
      }));
      fs.writeFileSync(tasksFilePath, JSON.stringify(rawTasks, null, 2));
    } catch (err) {
      console.error('Failed to persist task update:', err);
    }

    res.json(tasks[taskIndex]);
  });

  return router;
};
