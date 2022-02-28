var express = require('express');
const port = process.env.PORT || 3000

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', function(req, res) {
    res.send('hello')
  });

app.post('/posttest', function(req, res) {
  let person = {
    firstName : "John",
    lastName  : "Doe",
    age     : 50,
    eyeColor  : "blue",
    extra : [
      {exfirstName  : "recardo", exlastName : "de vos"},
      {exfirstName  : "lebo", exlastName : "bumpy"},
      {exfirstName  : "kgale", exlastName : "brandon"},
      {exfirstName  : "OB", exlastName : "GANG"}
    ]
  };
  let output = JSON.stringify(person)
  res.send(output)
});

app.post('/posttest', function(req, res) {
  res.send('i got this data ======> '+ req.body + '<======')
});
  
app.get('/home', function(req, res) {
    res.send('hello world!')
  });

app.listen(port, console.log("Server running on port: "+port))
module.exports = app;