const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  let userWithSameName = users.filter((user)=> {return user.username === username});
  return userWithSameName.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validUser = users.filter((user)=> {return user.username === username && user.password === password});
  return validUser.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if(!username || !password){
    return res.status(404).send(`Error logging in!`)
  }
  if (username && password) {
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign(
        { data: password },
        'access',
        { expiresIn : 60 * 60 } 
      );
      req.session.authorization = {
        accessToken,
        username
      };
      return res.status(200).send(`User ${username} logged in successfully. Welcome ${username}!`);
    }
  }
  else{
    return res.status(404).send(`Can't login. Check username/password`);
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.body.review;
  ;

  if (!req.session.authorization) {
    return res.status(401).json({message: "User not logged in. Please login to give reviews."})
  }
  const username = req.session.authorization.username;
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found!"});
  }
  else{
    books[isbn].reviews[username] = review;
    return res.status(200).json({
      message: `Review for ${books[isbn].title} added/updated successfully`,
      Book: books[isbn].title,
      Reviews: books[isbn].reviews
    })
  }
});

regd_users.delete("/auth/review/:isbn",(req,res)=>{
  const isbn = req.params.isbn;
  
  if (!req.session.authorization) {
    return res.status(401).json({message: "User not logged in!"})
  }

  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not Found!"})
  }
  if (books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).send(`Review of ${username} for book ${books[isbn].title} is delete successfully`);
  }else{
    return res.status(404).json({message: `No reviews by user ${username} for book ${books[isbn].title}`});
  }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
