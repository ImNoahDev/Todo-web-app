import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./todos.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, completed BOOLEAN)");
});

db.close();
