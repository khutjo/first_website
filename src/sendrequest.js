require("dotenv").config();
const request = require('request');
const rescompile = require("./response");

module.exports =  {
    send: async function(req, response, sendID) {


        const options = {
            url: `https://io.adafruit.com/api/v2/${process.env.ADAFRUIT_IO_USERNAME}/feeds/onoff/data/`,
            headers: {
                'X-AIO-Key': process.env.ADAFRUIT_IO_KEY,
                'Content-Type': 'application/json',
            },
            formData :{
                'value': sendID.send_id
            }


        };
        
        request.post(options, (err, res, body) => {
            if (err || res.statusCode >= 500) {
                rescompile.CompileError(response, 500, 'error sending MQTT ' + err);
                return
            }
            
            const bodyobj = JSON.parse(body);
            if (bodyobj.created_at){
                const resobj = {ACTION: req.body.ACTION, SCOPE: req.body.SCOPE, TIMESTAMP: bodyobj.created_at};
                response.send(rescompile.CompileSuccess(resobj));
            }
            else
            rescompile.CompileError(response, 500, 'error publishing MQTT ' + err);
        });
        
    }

}