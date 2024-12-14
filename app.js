const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {    
    res.send('Hello World!');
});

app.get('/petisi', (req, res) => {
    res.send('About us');
});

app.get('/laporan', (req, res) => {
    res.send('About us');
});

app.get('/chatbot', (req, res) => {
    res.send('About us');
});

app.get('/tambahPetisi', (req, res) => {
    res.send('About us');
});

app.get('/tambahLaporan', (req, res) => {
    res.send('About us');
});

app.listen(port, () => {
    console.log('Example app listening on port 3000!');
});