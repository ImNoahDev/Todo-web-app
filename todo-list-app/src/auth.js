import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./todos.db');
const secretKey = 'your_secret_key';

export async function registerUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, username });
      }
    });
  });
}

export async function authenticateUser(username, password) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
      if (err || !user || !(await bcrypt.compare(password, user.password))) {
        reject('Invalid credentials');
      } else {
        const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
        resolve({ token });
      }
    });
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    return null;
  }
}
