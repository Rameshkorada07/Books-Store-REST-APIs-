// test.js
const books = {
  "123456": { title: "Sample Book", author: "Author A", reviews: {} },
  "789012": { title: "Another Book", author: "Author B", reviews: {} }
};

// Task 10: async callback
function getAllBooks(cb) {
  setTimeout(() => cb(null, Object.values(books)), 100);
}

// Task 11: promises
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => books[isbn] ? resolve(books[isbn]) : reject('Not found'), 100);
  });
}

// Task 12: async/await
async function getBooksByAuthor(author) {
  return Object.values(books).filter(b => b.author.toLowerCase() === author.toLowerCase());
}

// Task 13: async/await
async function getBooksByTitle(title) {
  return Object.values(books).filter(b => b.title.toLowerCase() === title.toLowerCase());
}

// Test all
getAllBooks((err, data) => {
  console.log("Callback - All Books:", data);
});

getBookByISBN("123456")
  .then(book => console.log("Promise - Book by ISBN:", book))
  .catch(err => console.error(err));

(async () => {
  const byAuthor = await getBooksByAuthor("Author A");
  console.log("Async/Await - By Author:", byAuthor);

  const byTitle = await getBooksByTitle("Sample Book");
  console.log("Async/Await - By Title:", byTitle);
})();
