require("dotenv").config();
const CosmosClient = require('@azure/cosmos').CosmosClient
const DatabaseCreds = require("./config");
const rescompile = require("../src/response");
const sendrequest = require('../src/sendrequest');
const url = require('url')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")


const options = {
    endpoint: DatabaseCreds.endpoint,
    key: DatabaseCreds.key,
    userAgentSuffix: DatabaseCreds.userAgentSuffix
  };

const client = new CosmosClient(options)

class DatabaseConnection {

    constructor() {
        try {
            this.client = new CosmosClient(options)
        } catch (e) {
            this.error = true;
            this.errormessage = message;
        }
        this.error = false;
    }

    async getlogin(request, response) {
        let querySpec = null;
        if (request && request.body && request.body.USERNAME && request.body.PASSWORD)
            querySpec = {
                query: 'SELECT r.id, r.password FROM root r WHERE r.id = @id and r.confirmed = "YES"',
                parameters: 
                [
                    {
                        name: '@id',
                        value: request.body.USERNAME
                    }
                ]
            }
        else {
            rescompile.CompileError(response, 422, "No USERNAME/PASSWORD post var Found in request");
            return;
        }

        const { resources: results } = await client
        .database(DatabaseCreds.database)
        .container(DatabaseCreds.container.user.id)
        .items.query(querySpec)
        .fetchNext()

        if (results.length != 1){
            rescompile.CompileError(response, 403, "valid user not found " + results.length);
            return;
        }

        bcrypt.compare(request.body.PASSWORD, results[0].password, function(err, isMatch) {
            if (err) {
                rescompile.CompileError(response, 403, "bcrypt error \n" + err);
            } else if (!isMatch) {
                rescompile.CompileError(response, 403, "invalid password");
            } else {
                const token = jwt.sign(
                { user_id: results[0].id},
                    process.env.TOKEN_KEY,
                    {expiresIn: "2h"}
                );
                response.send(rescompile.CompileSuccess({TOKEN: token}));
            }
        })
        

    }

    async getactions(request, response, route) {
        const querySpec = {
            query: 'SELECT r.actions FROM root r WHERE r.id = @id',
            parameters: [
              {
                name: '@id',
                value: request.username
              }
            ]
          }

          const { resources: results } = await client
          .database(DatabaseCreds.database)
          .container(DatabaseCreds.container.user.id)
          .items.query(querySpec)
          .fetchNext()
          
            console.log(results[0])
            if (results.length != 1){
                rescompile.CompileError(response, 500, "no config found " + results.length);
                return;
            }
        response.send(rescompile.CompileSuccess(results[0]));
    }

    async getsendID(action, scope) {
        const querySpec = {
            query: 'SELECT r.send_id FROM root r WHERE r.id = @id and r.partitionKey = @scope',
            parameters: [
                {
                    name: '@id',
                    value: action
                },
                {
                    name: '@scope',
                    value: scope
                }
            ]
        }

        const { resources: results } = await client
        .database(DatabaseCreds.database)
        .container(DatabaseCreds.container.actions.id)
        .items.query(querySpec)
        .fetchNext()
        
        if (results.length != 1)
            return null
        
        return results[0]

    }

    async getsenddata(request) {
        const querySpec = {
            query: 'SELECT c.id , c.scope FROM root r JOIN c IN r.actions WHERE r.id = @id and c.id = @action and c.scope = @scope',
            parameters: [
              {
                name: '@id',
                value: request.username
              },
              {
                  name: '@action',
                  value: request.body.ACTION
              },
              {
                  name: '@scope',
                  value: request.body.SCOPE
              }
            ]
          }

        const { resources: results } = await client
        .database(DatabaseCreds.database)
        .container(DatabaseCreds.container.user.id)
        .items.query(querySpec)
        .fetchNext()
          
        console.log(results[0])
        if (results.length != 1){
            return null;
        }
        return results[0];
    }
}



module.exports = function() {

    this.getlogin = function(request, response) {
        let con = new DatabaseConnection();
        if (!con.error)
            con.getlogin(request, response)
            .catch(error => {rescompile.CompileError(response, 500, 'error runing request ' + error)});
        else
            rescompile.CompileError(response, 500, 'error seting up ' + con.errormessage);
    }

    this.getactions = function(request, response) {
        let con = new DatabaseConnection();
        if (!con.error)
            con.getactions(request, response)
            .catch(error => {rescompile.CompileError(response, 500, 'error runing request ' + error)});
        else
            rescompile.CompileError(response, 500, 'error seting up ' + con.errormessage);
    }

    this.getsenddata = function(request, response) {
        let con = new DatabaseConnection();
        if (!con.error)
            con.getsenddata(request)
            .then( senddataresults => { 
                if (senddataresults != null)
                    con.getsendID(senddataresults.id, senddataresults.scope)
                    .then(sendID => {
                        if (sendID != null)
                            sendrequest.send(request, response, sendID).
                            catch(error => {rescompile.CompileError(response, 500, 'error runing request ' + error, request.originalUrl)})
                        else
                            rescompile.CompileError(response, 500, 'error runing request send id is null')
                    })
                    .catch(error => {rescompile.CompileError(response, 500, 'error runing request ' + error)})
                else
                    rescompile.CompileError(response, 500, 'error runing request send data is null')
                })
            .catch(error => {rescompile.CompileError(response, 500, 'error runing request ' + error)});
        else
            rescompile.CompileError(response, 500, 'error seting up ' + con.errormessage);
    }
}