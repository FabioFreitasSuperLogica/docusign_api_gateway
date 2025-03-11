const express = require('express');
const bodyParser = require('body-parser');
const main = require('./app/Main.js');

const app = express();
const port = 3000;

// Middleware para interpretar JSON e dados de formulário
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/assinaturadigital', (req, res) => {
    let response = main.init(req.body);
    res.status(201).json({
        data: {
            envelopeId: response.envelopeId
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor ativo em http://localhost:${port}`);
});



