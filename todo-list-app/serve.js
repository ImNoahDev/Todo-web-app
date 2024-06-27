import { serve } from "bun";
import { readFileSync } from "fs";
import { join, extname } from "path";
import sqlite3 from 'sqlite3';
import { log, error } from "./logger.js";
import { registerUser, authenticateUser, verifyToken } from "./src/auth.js";

const db = new sqlite3.Database('./todos.db', (err) => {
  if (err) {
    error("Failed to connect to the database", err.message);
  } else {
    log("Connected to the SQLite database");
  }
});

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',};

serve({
  port: 3000,
  async fetch(req) {
    log(`${req.method} ${req.url}`);
    const url = new URL(req.url);

    if (req.method === 'POST' && url.pathname === '/api/register') {
      const body = await req.json();
      try {
        const user = await registerUser(body.username, body.password);
        return new Response(JSON.stringify(user), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response('User registration failed', { status: 400 });
      }
    } else if (req.method === 'POST' && url.pathname === '/api/login') {
      const body = await req.json();
      try {
        const { token } = await authenticateUser(body.username, body.password);
        return new Response(JSON.stringify({ token }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response('Login failed', { status: 400 });
      }
    } else if (req.method === 'GET' && url.pathname === '/api/todos') {
      const token = req.headers.get('Authorization')?.split(' ')[1];
      const user = verifyToken(token);
      if (!user) return new Response('Unauthorized', { status: 401 });
      return getTodos(user.id);
    } else if (req.method === 'POST' && url.pathname === '/api/todos') {
      const token = req.headers.get('Authorization')?.split(' ')[1];
      const user = verifyToken(token);
      if (!user) return new Response('Unauthorized', { status: 401 });
      const body = await req.json();
      return addTodo(body.text, user.id);
    } else if (req.method === 'DELETE' && url.pathname.startsWith('/api/todos/')) {
      const token = req.headers.get('Authorization')?.split(' ')[1];
      const user = verifyToken(token);
      if (!user) return new Response('Unauthorized', { status: 401 });
      const id = url.pathname.split('/').pop();
      return deleteTodo(id, user.id);
    } else if (req.method === 'PATCH' && url.pathname.startsWith('/api/todos/')) {
      const token = req.headers.get('Authorization')?.split(' ')[1];
      const user = verifyToken(token);
      if (!user) return new Response('Unauthorized', { status: 401 });
      const id = url.pathname.split('/').pop();
      const body = await req.json();
      return updateTodoStatus(id, body.completed, user.id);
    } else {
      return serveStatic(url.pathname);
    }
  },
});

function serveStatic(path) {
  const filePath = path === '/' ? 'index.html' : path;
  const fullPath = join('public', filePath);
  const ext = extname(fullPath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  try {
    const fileContent = readFileSync(fullPath);
    log(`Served static file: ${fullPath}`);
    return new Response(fileContent, {
      headers: { 'Content-Type': contentType }
    });
  } catch (err) {
    error(`File not found: ${fullPath}`, err.message);
    return new Response('File not found', { status: 404 });
  }
}

function getTodos(userId) {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM todos WHERE user_id = ?", [userId], (err, rows) => {
      if (err) {
        error("Failed to fetch todos", err.message);
        reject(new Response('Internal Server Error', { status: 500 }));
      } else {
        log("Fetched todos from the database");
        resolve(new Response(JSON.stringify(rows), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }
    });
  });
}

function addTodo(text, userId) {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO todos (text, completed, user_id) VALUES (?, ?, ?)", [text, false, userId], function (err) {
      if (err) {
        error("Failed to add todo", err.message);
        reject(new Response('Internal Server Error', { status: 500 }));
      } else {
        log(`Added todo: ${text} with id ${this.lastID}`);
        resolve(new Response(JSON.stringify({ id: this.lastID, text, completed: false }), {
          headers: { 'Content-Type': 'application/json' }
        }));
      }
    });
  });
}

function deleteTodo(id, userId) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM todos WHERE id = ? AND user_id = ?", [id, userId], function (err) {
      if (err) {
        error(`Failed to delete todo with id ${id}`, err.message);
        reject(new Response('Internal Server Error', { status: 500 }));
      } else {
        log(`Deleted todo with id ${id}`);
        resolve(new Response('Deleted', { status: 200 }));
      }
    });
  });
}

function updateTodoStatus(id, completed, userId) {
  return new Promise((resolve, reject) => {
    db.run("UPDATE todos SET completed = ? WHERE id = ? AND user_id = ?", [completed, id, userId], function (err) {
      if (err) {
        error(`Failed to update todo with id ${id}`, err.message);
        reject(new Response('Internal Server Error', { status: 500 }));
      } else {
        log(`Updated todo with id ${id} to completed=${completed}`);
        resolve(new Response('Updated', { status: 200 }));
      }
    });
  });
}

