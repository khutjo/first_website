var mysql = require('mysql');
const DatabaseCreds = require("./config.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")


class DatabaseConnection {

    constructor() {
        try {
            this.connection = mysql.createConnection(DatabaseCreds);
        } catch (e) {
            this.error = true;
            this.errormessage = message;
        }
        this.error = false;
    }

    getlogin(request, response, route) {
        const query = "SELECT `USER_ID`, `USERNAME`, `PASSWORD` FROM `USERS` WHERE `USERNAME` = ? ";
        let configs = null;
        if (request && request.body &&
            request.body.USERNAME)
            configs = [
                request.body.USERNAME
            ]

        else {
            response.send(CompileError("invalid request", route));
            return;
        }


        this.connection.connect(function(err) {
            if (err) {
                response.send(CompileError(err.code, route));
                return;
            }
        });


        this.connection.query(query, configs, (err, res, fields) => {
            if (err) {
                response.send(CompileError(err.code, route));
                return;
            } else if (res.length === 0) {
                response.send(CompileError("No input Found", route));
                return;
            }
            console.log(res[0].PASSWORD);
            console.log(request.body.PASSWORD);
            bcrypt.compare(request.body.PASSWORD, res[0].PASSWORD, function(err, isMatch) {
                if (err) {
                    response.send(CompileError("login error a", route));
                } else if (!isMatch) {
                    response.send(CompileError("login error b", route));
                } else {
                  console.log("Password matches!")
                  const token = jwt.sign(
                    { user_id: res[0].USER_ID, user_name:  res[0].USERNAME },
                    process.env.TOKEN_KEY,
                    {
                      expiresIn: "2h",
                    }
                  );
                  response.send(CompileSuccess(token, 'login', route, 'get login details'));
                }
              })
        });
        this.connection.end();
    }

    getactions(request, response, route) {
        const query = "SELECT `action_id`, `action_name` FROM `action`";
        


        this.connection.connect(function(err) {
            if (err) {
                response.send(CompileError(err.code, route));
                return;
            }
        });


        this.connection.query(query, (err, res, fields) => {
            if (err) {
                response.send(CompileError(err.code, route));
                return;
            } else if (res.length === 0) {
                response.send(CompileError("No Configs Found", route));
                return;
            }
            console.log(res);
            response.send(CompileSuccess(res, 'actions', route, 'get actions'));
                
              
        });
        this.connection.end();
    }

}

function CompileError(err, route) {
    var errorjson = {
        timestamp: new Date().toISOString(),
        status: 500,
        error: "Internal Server Error ",
        message: err,
        "path": route
    }
    return (errorjson);
}

function CompileSuccess(data, req, route, calltype) {
    var errorjson = {
        timestamp: new Date().toISOString(),
        status: 200,
        success: true,
        message: calltype + " success",
        path: route,
        data: data,
        request: req
    }
    return (errorjson);
}

module.exports = function() {

    this.getlogin = function(request, response) {
        let con = new DatabaseConnection();
        if (!con.error)
            con.getlogin(request, response);
        else
            response.send(CompileError(con.errormessage))
    }

    this.getactions = function(request, response) {
        let con = new DatabaseConnection();
        if (!con.error)
            con.getactions(request, response);
        else
            response.send(CompileError(con.errormessage))
    }
}