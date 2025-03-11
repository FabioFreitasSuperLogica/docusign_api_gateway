const fs = require('fs-extra');
const docusign = require('docusign-esign');

class Envelope {

    static async sendEnvelope(args) {
        let dsApiClient = new docusign.ApiClient();
        dsApiClient.setBasePath(args.basePath);
        dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

        let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
        let results = await envelopesApi.createEnvelope(args.accountId, {
            envelopeDefinition: this.getEnvelope(args.envelopeArgs),
        });

        return { envelopeId: results.envelopeId };
    }

    static getEnvelope(args) {

        let docPdfBytes = fs.readFileSync(args.docFile);
        let envelope = new docusign.EnvelopeDefinition();
        let docbase64 = Buffer.from(docPdfBytes).toString('base64');
        let pdf = new docusign.Document.constructFromObject({
            documentBase64: docbase64,
            name: 'Termo de Consentimento',
            fileExtension: 'pdf',
            documentId: '1',
        });

        let signer = docusign.Signer.constructFromObject({
            email: args.signerEmail,
            name: args.signerName,
            recipientId: '1',
            routingOrder: '1',
        });

        let signer2 = docusign.Signer.constructFromObject({
            email: args.signerEmail2,
            name: args.signerName2,
            recipientId: '2',
            routingOrder: '2',
        });

        let signPlace = docusign.SignHere.constructFromObject({
            anchorString: '/sn1/',
            anchorYOffset: '0',
            anchorUnits: 'pixels',
            anchorXOffset: '0',
        });

        let signPlace2 = docusign.SignHere.constructFromObject({
            anchorString: '/sn2/',
            anchorYOffset: '0',
            anchorUnits: 'pixels',
            anchorXOffset: '0',
        });

        let signerTabs = docusign.Tabs.constructFromObject({
            signHereTabs: [signPlace]
        });

        let signerTabs2 = docusign.Tabs.constructFromObject({
            signHereTabs: [signPlace2]
        });

        signer.tabs = signerTabs;
        signer2.tabs = signerTabs2;

        let cc1 = new docusign.CarbonCopy();
        cc1.email = args.ccEmail;
        cc1.name = args.ccName;
        cc1.routingOrder = '3';
        cc1.recipientId = '3';

        let recipients = docusign.Recipients.constructFromObject({
            signers: [signer, signer2],
            carbonCopies: [cc1],
        });

        envelope.recipients = recipients;
        envelope.emailSubject = 'Solicitacao de Assinatura';
        envelope.documents = [pdf];
        envelope.status = args.status;

        return envelope;
    }
}

module.exports = Envelope;