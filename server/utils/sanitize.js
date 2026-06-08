/**
 * Data sanitization utilities for models and tasks.
 * Cleans inconsistencies found in the raw JSON data files.
 */

// Provider name standardization map
const PROVIDER_MAP = {
  openforma: 'OpenForma',
};

/**
 * Sanitizes raw model data:
 * - Trims whitespace from names
 * - Standardizes provider casing
 * - Normalizes date formats to YYYY-MM-DD
 * - Flags outlier latency values (≥9999ms)
 */
function sanitizeModels(rawModels) {
  return rawModels.map((model) => {
    // 1. Trim name whitespace (fixes "  Polyglot-Pro ")
    const cleanName = model.name.trim();

    // 2. Standardize provider casing (fixes "openforma" -> "OpenForma")
    const rawProvider = model.provider.trim();
    const lowerProvider = rawProvider.toLowerCase();
    const cleanProvider =
      PROVIDER_MAP[lowerProvider] ||
      rawProvider.charAt(0).toUpperCase() + rawProvider.slice(1);

    // 3. Flag outlier latency (9999ms = timeout)
    const hasLatencyError = model.latencyMs >= 9999;

    // 4. Standardize evaluatedAt date format
    let formattedDate = null;
    if (model.evaluatedAt) {
      const raw = model.evaluatedAt.trim();
      if (raw.includes('/')) {
        // Handle DD/MM/YYYY format (e.g., "02/05/2026" -> "2026-05-02")
        const [day, month, year] = raw.split('/');
        formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        formattedDate = raw;
      }
    }

    return {
      id: model.id,
      name: cleanName,
      provider: cleanProvider,
      accuracy: model.accuracy,
      latencyMs: model.latencyMs,
      costPer1k: model.costPer1k,
      evaluatedAt: formattedDate,
      hasLatencyError,
    };
  });
}

/**
 * Sanitizes raw task data:
 * - Normalizes empty status strings to "pending"
 * - Handles null assignedTo gracefully
 */
function sanitizeTasks(rawTasks) {
  return rawTasks.map((task) => ({
    id: task.id,
    title: task.title,
    projectId: task.projectId,
    projectName: task.projectName,
    clientId: task.clientId,
    assignedTo: task.assignedTo || null,
    status: task.status && task.status.trim() !== '' ? task.status : 'pending',
  }));
}

module.exports = { sanitizeModels, sanitizeTasks };
