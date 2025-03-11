const jwt = require('./Jwt.js');
const email = require('./Envelope.js');

class Main {

    static async init(requestData) {
        let accountInfo = await jwt.authenticate();
        let args = await jwt.getArgs(accountInfo, requestData);

        return await email.sendEnvelope(args);
    }

}

module.exports = Main;