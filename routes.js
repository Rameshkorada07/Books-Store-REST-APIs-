// routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// In-memory user and book data
const users = [];
const books = {
  "9780140449136": {
    title: "The Odyssey",
    author: "Homer",
    reviews: {}
  },
  "9780439139601": {
    title: "Harry Potter and the Goblet of Fire",
    author: "J.K. Rowling",
    reviews: {}
  },
  "9780061120084": {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    reviews: {}
  },
  "9780451524935": {
    title: "1984",
    author: "George Orwell",
    reviews: {}
  },
  "9780316769488": {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    reviews: {}
  },
  "9780743273565": {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    reviews: {}
  },
  "9780307277671": {
    title: "The Road",
    author: "Cormac McCarthy",
    reviews: {}
  },
  "9781501124020": {
    title: "It Ends with Us",
    author: "Colleen Hoover",
    reviews: {}
  },
  "9780385504201": {
    title: "The Da Vinci Code",
    author: "Dan Brown",
    reviews: {}
  }
};


// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token required');

  jwt.verify(token.split(" ")[1], 'jwt_secret', (err, user) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
}

// --- Public Routes ---

// Get all books
router.get('/books', (req, res) => {
  res.json(books);
});

// Get book by ISBN
router.get('/books/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  book ? res.json(book) : res.status(404).send('Book not found');
});

// Get books by author
router.get('/books/author/:author', (req, res) => {
  const result = Object.values(books).filter(b => b.author.toLowerCase() === req.params.author.toLowerCase());
  res.json(result);
});

// Get books by title
router.get('/books/title/:title', (req, res) => {
  const result = Object.values(books).filter(b => b.title.toLowerCase() === req.params.title.toLowerCase());
  res.json(result);
});

// Get reviews for a book
router.get('/books/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).send('Book not found');
  res.json(book.reviews);
});

// Register user
router.post('/register', async (req, res) => {
   console.log('Register endpoint hit');
  const { username, password } = req.body;
  const userExists = users.find(u => u.username === username);
  if (userExists) return res.status(400).send('User already exists');
  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  res.send('User registered');
});

// Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).send('User not found');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).send('Invalid password');

  const token = jwt.sign({ username }, 'jwt_secret');
  res.json({ token });
});

// --- Authenticated Routes ---

// Add or modify a review
router.post('/auth/review/:isbn', authenticateToken, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;

  if (!books[isbn]) return res.status(404).send('Book not found');

  books[isbn].reviews[req.user.username] = review;
  res.send('Review added/updated');
});

// Delete a review
router.delete('/auth/review/:isbn', authenticateToken, (req, res) => {
  const { isbn } = req.params;

  if (!books[isbn]) return res.status(404).send('Book not found');

  if (!books[isbn].reviews[req.user.username]) {
    return res.status(403).send('You did not post a review for this book');
  }

  delete books[isbn].reviews[req.user.username];
  res.send('Review deleted');
});

module.exports = router;
