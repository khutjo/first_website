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
        queueSvc.createQueueIfNotExists('messages', function(error, results, response){
    if(!error){
        queueSvc.createMessage('messages', req.query.name, function(error, results, response){
            if(!error){
                res.render("index", 
                { title: "Protected",
                topics: ['hello', 'khutjo', 'job', 'done']
             });
            }else
            res.render("index", 
            { title: "Protected",
            topics: ['hello', 'khutjo', 'didnt', 'work']
         });
          });
    }
  });
})
app.get("/get" , (req, res) => {
    queueSvc.getMessages('messages', function(error, results, response){
        if(!error){
            console.log(results[0].messageText)
                res.render("index", 
                { title: "Protected",
                topics: ['hello', 'khutjo', 'this', 'is', 'the', 'output',results[0].messageText]})
          var message = results[0];
          queueSvc.deleteMessage('messages', message.messageId, message.popReceipt, function(error, response){
            if(!error){
              //message deleted
            }
          });
        }else
        res.render("index", 
        { title: "Protected",
        topics: ['hello', 'khutjo', 'didnt', 'work']
     });
      });
})

app.listen(port, () => {
    console.log('Server is listening on port 3000');
});
