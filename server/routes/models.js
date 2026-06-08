const express = require('express');
const router = express.Router();

/**
 * Model routes factory.
 * Receives the sanitized in-memory models array.
 */
module.exports = function createModelsRouter(models) {
  // GET /api/models — returns all sanitized models
  router.get('/', (req, res) => {
    res.json(models);
  });

  return router;
};
