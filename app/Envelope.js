const docusign = require('docusign-esign');

const envelopeSubject = 'Solicitação de Assinatura';
const envelopeStatus = 'sent';
class Envelope {

    static _routingOrder;

    static async sendEnvelope(args, requestData) {

        let dsApiClient = new docusign.ApiClient();
        dsApiClient.setBasePath(args.basePath);
        dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);

        let envelopesApi = new docusign.EnvelopesApi(dsApiClient);
        let results = await envelopesApi.createEnvelope(args.accountId, {
            envelopeDefinition: this.getEnvelope(requestData),
        });

        return { envelopeId: results.envelopeId };
    }

    static getEnvelope(requestData) {

        let envelope = new docusign.EnvelopeDefinition();

        envelope.recipients = docusign.Recipients.constructFromObject({
            signers: this._getSigners(requestData.signers),
            carbonCopies: this._getCarbonCopies(requestData.carbon_copies),
        });

        envelope.emailSubject = envelopeSubject;
        envelope.documents = this._getDocuments(requestData.files);
        envelope.status = envelopeStatus;

        return envelope;
    }

    static _getSigners(requestSigners) {

        let signers = [];
        let sizeOf = requestSigners.length;
        let order = 0;

        for (let i = 0; i < sizeOf; i++) {
            order++;
            let signPlace = docusign.SignHere.constructFromObject({
                anchorString: '/sn' + order + '/',
                anchorYOffset: '0',
                anchorUnits: 'pixels',
                anchorXOffset: '0',
            });

            signers.push(docusign.Signer.constructFromObject({
                name: requestSigners[i].name,
                email: requestSigners[i].email,
                recipientId: order,
                routingOrder: order,
                tabs: {
                    signHereTabs: [signPlace]
                }
            }));
        }

        this._routingOrder = parseInt(order);

        return signers;
    }

    static _getDocuments(requestFiles) {

        let documents = [];
        let order = 0;
        let sizeOf = requestFiles.length;

        for (let i = 0; i < sizeOf; i++) {
            order++;
            documents.push(new docusign.Document.constructFromObject({
                documentBase64: requestFiles[i].base64,
                name: requestFiles[i].name,
                fileExtension: requestFiles[i].extension,
                documentId: order,
            }));
        }

        return documents;
    }

    static _getCarbonCopies(requestCcs) {

        let carbonCopies = [];
        let sizeOf = requestCcs.length;

        for (let i = 0; i < sizeOf; i++) {
            this._routingOrder++;
            let cc = new docusign.CarbonCopy();
            cc.email = requestCcs[i].email;
            cc.name = requestCcs[i].name;
            cc.routingOrder = this._routingOrder;
            cc.recipientId = this._routingOrder;
            carbonCopies.push(cc);
        }

        return carbonCopies;
    }
}

module.exports = Envelope;