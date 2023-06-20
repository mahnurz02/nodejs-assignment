const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

require('dotenv').config();

const authenticateToken = require('../middlewares/authMiddleware');

const usersFile = path.join(__dirname, '..', 'users.json');
const secretKey = process.env.SECRET_JWT_KEY;

// GET users listing - baseurl/users (GET)
router.get('/', (req, res) => {
  try {
    let users = [];
    try {
      users = JSON.parse(fs.readFileSync(usersFile));
    } catch (error) {
      console.error(error);
    }
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Create a new user -  baseurl/users (POST)
router.post('/', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: uuidv4(), username, email, password: hashedPassword };
    let users = [];
    try {
      users = JSON.parse(fs.readFileSync(usersFile));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error.' });
    }
    users.push(newUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Login user -  baseurl/users/login (POST)

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  try {
    const users = JSON.parse(fs.readFileSync(usersFile));
    const user = users.find((user) => user.email === email);
    if (user && bcrypt.compareSync(password, user.password)) {
      const tokenPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        // Add any other user details you want to include
      };
      const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });
      res.status(200).json({ message: `Welcome ${user.username}!`, token });
      return;
    } else {
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Delete the user - baseurl/users/delete/:id (DELETE)

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    let users = JSON.parse(fs.readFileSync(usersFile));
    const user = users.find((user) => user.id === id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    users = users.filter((user) => user.id !== id);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Protected route to get user's details -  baseurl/users/profile (GET)

router.get('/profile', authenticateToken, (req, res) => {
  // The user's details can be accessed from req.user
  const userDetails = req.user;

  res.json(userDetails);
});

// protected route to update the user's details -  baseurl/users/profile (PATCH)

router.patch('/profile', authenticateToken, (req, res) => {
  const { id } = req.user;
  const { username } = req.body;
  try {
    let users = JSON.parse(fs.readFileSync(usersFile));

    const user = users.find((user) => user.id === id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (username) {
      user.username = username;
      fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
      res.status(200).json({ message: 'User updated successfully.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Update user without authentication -  baseurl/users/:id (PATCH)

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFile));
  const user = users.find((user) => user.id === id);
  try {
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.username = username;
    user.email = email;
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.status(200).json({ message: 'User updated successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// GET user by id - baseurl/users/:id (GET)

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const users = JSON.parse(fs.readFileSync(usersFile));
  const user = users.find((user) => user.id === id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found.' });
  }
  try {
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;
