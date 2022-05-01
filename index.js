require("dotenv").config();
var express = require('express');
const Connect = require("./database/dbconnection");
const rescompile = require("./src/response");
const sendrequest = require('./src/sendrequest');
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const checkToken = (req, res, next) => {
  const header = req.headers['authorization'];
  if(typeof header !== 'undefined') {
      const bearer = header.split(' ');
      const token = bearer[1];

      req.token = token;
      jwt.verify(req.token, process.env.TOKEN_KEY, (err, authorizedData) => {
          if(err)
          rescompile.CompileError(res, 403, "invalid JWT sent");
          else{
            req.username = authorizedData.user_id
            next();
          }
      })
  } else 
    rescompile.CompileError(res, 403, "no JWT sent");
}

app.post('/postplain', function(req, res) {
  console.log(req)
  rescompile.CompileError(res, 403, "no JWT sent");
});


app.post('/login', function(req, res) {
  let connect = new Connect();
  connect.getlogin(req, res, '/login');
});

app.post('/refresh', checkToken, function(req, res) {
  let connect = new Connect();
  connect.getrefresh(req, res, '/login');
});
  

app.get('/connect', checkToken, function(req, res) {
  let connect = new Connect();
  connect.getactions(req, res, '/connect');
});

app.post('/send', checkToken, function(req, res) {
  let connect = new Connect();
  connect.getsenddata(req, res, '/send');
});

app.listen(port, console.log("Server running on port: "+port))
module.exports = app;