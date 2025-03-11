const docusign = require('docusign-esign');
const fs = require('fs');
const path = require('path');
const jwtConfig = require('../jwtConfig.json');

const demoDocsPath = path.resolve(__dirname, '../../demo_documents');
const docFile = 'termo_de_consentimento.pdf';

const SCOPES = [
    'signature', 'impersonation'
];

class Jwt {
    static getConsent() {
        let urlScopes = SCOPES.join('+');
        let redirectUri = 'https://developers.docusign.com/platform/auth/consent';
        let consentUrl = `${jwtConfig.dsOauthServer}/oauth/auth?response_type=code&` +
            `scope=${urlScopes}&client_id=${jwtConfig.dsJWTClientId}&` +
            `redirect_uri=${redirectUri}`;

        console.log('Open the following URL in your browser to grant consent to the application:');
        console.log(consentUrl);
        console.log('Consent granted? \n 1)Yes \n 2)No');
        let consentGranted = prompt('');
        if (consentGranted === '1') {
            return true;
        } else {
            console.error('Please grant consent!');
            process.exit();
        }
    }

    static async authenticate() {
        let jwtLifeSec = 10 * 60; // requested lifetime for the JWT is 10 min
        let dsApi = new docusign.ApiClient();
        dsApi.setOAuthBasePath(jwtConfig.dsOauthServer.replace('https://', '')); // it should be domain only.
        let rsaKey = fs.readFileSync(jwtConfig.privateKeyLocation);

        try {
            let results = await dsApi.requestJWTUserToken(jwtConfig.dsJWTClientId,
                jwtConfig.impersonatedUserGuid, SCOPES, rsaKey,
                jwtLifeSec);
            let accessToken = results.body.access_token;

            // get user info
            let userInfoResults = await dsApi.getUserInfo(accessToken);

            // use the default account
            let userInfo = userInfoResults.accounts.find(account =>
                account.isDefault === 'true');

            return {
                accessToken: results.body.access_token,
                apiAccountId: userInfo.accountId,
                basePath: `${userInfo.baseUri}/restapi`
            };
        } catch (e) {
            console.log(e);
            let body = e?.response?.body || e?.response?.data;
            // Determine the source of the error
            if (body) {
                // The user needs to grant consent
                if (body?.error === 'consent_required') {
                    if (this.getConsent()) { return authenticate(); };
                } else {
                    // Consent has been granted. Show status code for DocuSign API error
                    this._debug_log(`\nAPI problem: Status code ${e.response.status}, message body:
                    ${JSON.stringify(body, null, 4)}\n\n`);
                }
            }
        }
    }

    static async getArgs(account, request) {
        return {
            accessToken: account.accessToken,
            basePath: account.basePath,
            accountId: account.apiAccountId,
            envelopeArgs: {
                signerEmail: request.email,
                signerName: request.nome,
                signerEmail2: request.email2,
                signerName2: request.nome2,
                ccEmail: request.ccEmail,
                ccName: request.ccName,
                status: 'sent',
                docFile: path.resolve(demoDocsPath, docFile)
            }
        };
    }
}

module.exports = Jwt;