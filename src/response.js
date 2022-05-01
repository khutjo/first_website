require("dotenv").config();
const debug = process.env.devdebug || false

module.exports =  {
    CompileError: function(response, code, err) {
        var errorjson = {
            timestamp: new Date().toISOString(),
            message: debug ? err : "unable to process request at the moment please try again in a bit",
            "path": response.req.url
        }

        response.status(code).send (errorjson);
    },

    CompileSuccess: function(data) {
        var errorjson = {
            timestamp: new Date().toISOString(),
            data: data
        }
        return (JSON.stringify(errorjson));
    }
}