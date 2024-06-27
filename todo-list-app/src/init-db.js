import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./todos.db', (err) => {
  if (err) {
    console.error('Failed to connect to the database', err.message);
  } else {
    console.log('Connected to the SQLite database');
    initializeTables();
  }
});

function initializeTables() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT 0,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
}

initializeTables();
