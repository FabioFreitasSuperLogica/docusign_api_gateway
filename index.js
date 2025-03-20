const express = require('express');
const bodyParser = require('body-parser');
const main = require('./app/Main.js');

const app = express();
const port = 3000;

// Middleware para interpretar JSON e dados de formulário
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/assinaturadigital', (req, res) => {
    try {
        const response = main.init(req.body);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Servidor ativo em http://localhost:${port}`);
});



