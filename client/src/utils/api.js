/**
 * API fetching utilities for communicating with the Express backend.
 */

const API_BASE = '/api';

export async function fetchModels() {
  const res = await fetch(`${API_BASE}/models`);
  if (!res.ok) throw new Error('Failed to fetch models');
  return res.json();
}

export async function fetchTasks(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${API_BASE}/tasks?${query}` : `${API_BASE}/tasks`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function updateTaskStatus(taskId, status) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  
  if (!res.ok) throw new Error('Failed to update task status');
  return res.json();
}
