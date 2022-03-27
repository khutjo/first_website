require("dotenv").config();
var express = require('express');
const Connect = require("./database/dbconnection");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const checkToken = (req, res, next) => {
  const header = req.headers['authorization'];
  console.log('shit');
  if(typeof header !== 'undefined') {
      const bearer = header.split(' ');
      const token = bearer[1];

      req.token = token;
      jwt.verify(req.token, process.env.TOKEN_KEY, (err, authorizedData) => {
          if(err)
              res.sendStatus(403);
          else
            next();
      })
  } else {
      res.sendStatus(403)
  }
}




app.post('/login', function(req, res) {
  let connect = new Connect();
  connect.getlogin(req, res, '/login');
});
  

app.get('/connect', checkToken, function(req, res) {
  let connect = new Connect();
  connect.getactions(req, res, '/connect');
});

app.post('/send', checkToken, function(req, res) {

  let output = JSON.stringify(person)
  res.send(output)
});

app.listen(port, console.log("Server running on port: "+port))
module.exports = app;






// const bcrypt = require("bcryptjs")

// const password = "khutjo@26"
// const saltRounds = 10

// bcrypt.genSalt(saltRounds, function (err, salt) {
//   if (err) {
//     throw err
//   } else {
//     bcrypt.hash(password, salt, function(err, hash) {
//       if (err) {
//         throw err
//       } else {
//         console.log(hash)
//         //$2a$10$FEBywZh8u9M0Cec/0mWep.1kXrwKeiWDba6tdKvDfEBjyePJnDT7K
//       }
//     })
//   }
// })





// const passwordEnteredByUser = "khutjo@26"
// const hash = "$2a$10$eLWv2Dd3bwgrIqoH5J8ZXuux/.uUXCV3dhs/9Za8ikjxspgAagBru"

// bcrypt.compare(passwordEnteredByUser, hash, function(err, isMatch) {
//   if (err) {
//     throw err
//   } else if (!isMatch) {
//     console.log("Password doesn't match!")
//   } else {
//     console.log("Password matches!")
//   }
// })