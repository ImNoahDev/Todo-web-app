import { serve } from "bun";
import { readFileSync } from "fs";
import { join, extname } from "path";
import sqlite3 from 'sqlite3';
import { log, error } from "./logger.js"; // Import the logging utility

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
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

serve({
  port: 3000,
  async fetch(req) {
    log(`${req.method} ${req.url}`);
    const url = new URL(req.url);

    if (req.method === 'GET' && url.pathname === '/api/todos') {
      return getTodos();
    } else if (req.method === 'POST' && url.pathname === '/api/todos') {
      const body = await req.json();
      return addTodo(body.text);
    } else if (req.method === 'DELETE' && url.pathname.startsWith('/api/todos/')) {
      const id = url.pathname.split('/').pop();
      return deleteTodo(id);
    } else if (req.method === 'PATCH' && url.pathname.startsWith('/api/todos/')) {
      const id = url.pathname.split('/').pop();
      const body = await req.json();
      return updateTodoStatus(id, body.completed);
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

function getTodos() {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM todos", [], (err, rows) => {
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

function addTodo(text) {
  return new Promise((resolve, reject) => {
    db.run("INSERT INTO todos (text, completed) VALUES (?, ?)", [text, false], function (err) {
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

function deleteTodo(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM todos WHERE id = ?", [id], function (err) {
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

function updateTodoStatus(id, completed) {
  return new Promise((resolve, reject) => {
    db.run("UPDATE todos SET completed = ? WHERE id = ?", [completed, id], function (err) {
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
