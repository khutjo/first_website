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

    constructor(response) {
        try {
            this.client = new CosmosClient(options)
        } catch (e) {
            this.error = true;
            rescompile.CompileError(response, 500, 'error seting up ' + message);
        }
        this.error = false;
    }

    async setrefreshtoken(response, useritem) {
        const token = jwt.sign(
            { user_id: results[0].id},
                process.env.TOKEN_KEY,
                {expiresIn: "2h"}
            );
        const refeshtoken = jwt.sign(
            { user_id: useritem.id},
                process.env.TOKEN_KEY,
                {expiresIn: "7d"}
            );
        useritem.RefreshToken = refeshtoken

        const { resource: results } = await container
        .item(useritem.id, useritem.partitionKey)
        .replace(useritem);

        if (results == 1)
            response.send(rescompile.CompileSuccess({TOKEN: token, REFRESHTOKEN: refeshtoken}));
        else 
            rescompile.CompileError(response, 500, 'error generating tokens ' + error);
    }

    async getlogin(request, response) {
        let querySpec = null;
        if (request && request.body && request.body.USERNAME && request.body.PASSWORD)
            querySpec = {
                query: 'SELECT * FROM root r WHERE r.id = @id and r.confirmed = "YES"',
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
            return null;
        }

        const { resources: results } = await client
        .database(DatabaseCreds.database)
        .container(DatabaseCreds.container.user.id)
        .items.query(querySpec)
        .fetchNext()

        if (results.length != 1){
            rescompile.CompileError(response, 403, "valid user not found " + results.length);
            return null;
        }

        bcrypt.compare(request.body.PASSWORD, results[0].password, function(err, isMatch) {
            if (err) {
                rescompile.CompileError(response, 403, "bcrypt error \n" + err);
                return null;
            } else if (!isMatch) {
                rescompile.CompileError(response, 403, "invalid password");
                return null;
            } else {
                console.log(results)
                return results[0];
                // setrefreshtoken(response, results)
                // .catch(error => {rescompile.CompileError(response, 500, 'error generating tokens ' + error)});
                // })
                
            }
        })
    }

    async getactions(request, response) {
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

    async getsendID(response, action, scope) {
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
        
        if (results.length != 1){
            rescompile.CompileError(response, 500, 'error runing request send id is null')
            return null
        }
        return results[0]

    }

    async getsenddata(request, response) {
        let querySpec = null;
        if (request && request.body && request.body.ACTION && request.body.SCOPE)
        querySpec = {
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
          else {
            rescompile.CompileError(response, 500, "No ACTION/SCOPE post var Found in request");
            return null;
        }

        const { resources: results } = await client
        .database(DatabaseCreds.database)
        .container(DatabaseCreds.container.user.id)
        .items.query(querySpec)
        .fetchNext()
          
        console.log(results[0])
        if (results.length != 1){
            rescompile.CompileError(response, 500, 'error runing request send data is null')
            return null;
        }
        return results[0];
    }
}



module.exports = function() {

    this.getlogin = function(request, response) {
        let con = new DatabaseConnection(response);
        if (!con.error)
            con.getlogin(request, response)
            .then(result => console.log(result))
            .catch(error => {rescompile.CompileError(response, 500, 'error runing request ' + error)});
    }

    this.getactions = function(request, response) {
        let con = new DatabaseConnection(response);
        if (!con.error)
            con.getactions(request, response)
            .catch(error => {rescompile.CompileError(response, 500, 'error runing request ' + error)});
    }

    this.getsenddata = function(request, response) {
        let con = new DatabaseConnection(response);
        if (!con.error)
            con.getsenddata(request, response)
            .then( senddataresults => { 
                if (senddataresults != null)
                    con.getsendID(response, senddataresults.id, senddataresults.scope)
                    .then(sendID => {
                        if (sendID != null)
                            sendrequest.send(request, response, sendID).
                            catch(error => {rescompile.CompileError(response, 500, 'error runing request ' + error, request.originalUrl)})
                    })
                    .catch(error => {rescompile.CompileError(response, 500, 'error runing request ' + error)})
                })
            .catch(error => {rescompile.CompileError(response, 500, 'error runing request ' + error)});
    }
}