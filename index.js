var express = require('express');

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', function(req, res) {
    res.send('hello')
  });

app.get('/home', function(req, res) {
    res.send('hello world!')
  });

app.listen(8080, console.log("Server running on port: 8080"))
module.exports = app;