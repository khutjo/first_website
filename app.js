var createError = require("http-errors");
var azure = require('azure-storage');

var queueSvc = azure.createQueueService();
var express = require("express");

var app = express();
const path = require('path');
app.set("view engine", "hbs");

app.use(express.static("views"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/stylesheets'));

let port = process.env.PORT || 3000;

app.get("/" , (req, res) => {


        res.render("index", 
        { title: "Protected",
        topics: ['hello', 'khutjo', 'whats', 'up']
     });
    });

app.get("/add" , (req, res) => {
    res.render("index", 
    { title: "Protected",
    topics: ['hello', 'khutjo', 'whats', 'up']
 });
})
app.get("/get" , (req, res) => {
    res.render("index", 
    { title: "Protected",
    topics: ['hello', 'khutjo', 'whats', 'up']
 });
})

app.listen(port, () => {
    console.log('Server is listening on port 3000');
});
