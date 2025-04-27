const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req, res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({
        "username": username,
        "password": password
      });
      return res.status(200).send(`User ${username} is registered successfully. Now you can login`);
    }
    else {
      return res.status(404).send(`User ${username} already exists.`);
    }
  }
  else {
    return res.status(404).json({ message: "Username/Password not provided." });
  }
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  //Write your code here
  //return res.send(JSON.stringify(books, null, 4));
  try {
    const getBooksAsync = () => {
      return new Promise((resolve, reject) => {
        resolve(books);
      });
    };
    const result = await getBooksAsync();
    return res.send(JSON.stringify(result, null, 4))
  } catch (error) {
    return res.status(500).send("Failed to fetch books.")
  }
});




// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  //return res.send(`Book's author is ${books[isbn]["author"]} and book name is ${books[isbn]["title"]} and these are its reviews: ${books[isbn]["reviews"]}`)

  const getBookDetails = (isbn) => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve({
          title: book.title,
          author: book.author
        });
      } else {
        reject('book not found');
      }
    })
  };

  try {
    const response = await getBookDetails(isbn);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).send("Failed to get the book!");
  }
});


// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  //Write your code here
  /*const author = req.params.author.toLowerCase()
   let booksByAuthor = [];

  for (let isbnId in books) {
    if (books[isbnId].author.toLowerCase() === author) {
      booksByAuthor.push({
        isbn: isbnId,
        title: books[isbnId].title
      })
    }
  }

  if (booksByAuthor.length > 0) {
    return res.send(JSON.stringify(booksByAuthor, null, 4));
  }
  else {
    return res.send(`No books of ${author} were found`);
  } */

  const author = req.params.author;

  const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      // Filter books by the given author
      const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase() === author.toLowerCase());

      if (booksByAuthor.length > 0) {
        resolve(booksByAuthor);  // Resolve with all books by that author
      } else {
        reject('No books found for this author');
      }
    });
  };

  try {
    const response = await getBooksByAuthor(author);
    return res.status(200).json(response);  // Return the books list in JSON format
  } catch (error) {
    return res.status(404).send(`Failed to get books: ${error}`);
  }
});


// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  //Write your code here
  //const bookTitle = req.params.title.toLowerCase();
  /* let found = false;
  for (let isbnId in books) {
    if (books[isbnId].title.toLowerCase() === bookTitle) {
      res.send(`Details of Book Title:\nISBN: ${isbnId}\nAuthor: ${books[isbnId].author}`);
      found = true;
      break;
    }
  }
  if (!found) {
    return res.send(`Details for ${bookTitle} not found!`)
  } */
  const title = req.params.title;

  const getBookByTitle = (title) => {
    return new Promise((resolve, reject) => {
      // Search for the book by title
      const book = Object.values(books).find(book => book.title.toLowerCase() === title.toLowerCase());

      if (book) {
        resolve(book);  // Resolve with the book details
      } else {
        reject('Book not found');
      }
    });
  };

  try {
    const response = await getBookByTitle(title);
    return res.status(200).json(response);  // Return the book details in JSON format
  } catch (error) {
    return res.status(404).send(`Failed to get the book: ${error}`);
  }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  //Write your code here
  const isbn = req.params.isbn.toLowerCase();

  let found = false;

  for (let isbnId in books) {
    if (isbnId === isbn) {
      found = true;
      const hasReviews = Object.keys(books[isbnId].reviews).length > 0;
      return res.send(`
        Book Found:
        ISBN: ${isbnId}
        Title: ${books[isbnId].title}
        Author: ${books[isbnId].author}
        Reviews: ${hasReviews ? JSON.stringify(books[isbnId].reviews) : "No reviews yet."}
        `);
      break;
    }
  }

  if (!found) {
    return res.send(`No book found for ISBN Number ${isbn}`);
  }

});

module.exports.general = public_users;
