import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import bp from 'body-parser';
import mysql from 'mysql';
import cors from 'cors';

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'suarakan'
})

// Initialize environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bp.json()); // For JSON payloads
app.use(bp.urlencoded({ extended: true })); // For form payloads

var corsOptions = {
    origin: "http://localhost:3000"
  };
  
app.use(cors(corsOptions));

// Set up the view engine for rendering HTML (optional)
app.set('view engine', 'ejs');

// Initialize Gemini API client
const geminiApiKey = process.env.API_KEY;
if (!geminiApiKey) {
    throw new Error('API_KEY is missing in the .env file');
}

const googleAI = new GoogleGenerativeAI(geminiApiKey);
const geminiConfig = {
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    maxOutputTokens: 200, // Adjust as per your needs
};

const geminiModel = googleAI.getGenerativeModel({
    model: "gemini-pro",
    geminiConfig,
  });

// Routes
// Home route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/chatbot', async (req, res) => {
    res.render('chatbot');
})

app.post('/chatbot', async (req, res) => {
    try {
        const prompt = req.body.prompt;
        
        const generate = async (textPrompt) => {
            try {
              const prompt = textPrompt;
              const result = await geminiModel.generateContent(prompt);
              const response = result.response;
              return response.text();
            } catch (error) {
              console.log("response error", error);
            }
          };
           
        var response = await generate(prompt);

        res.json({ prompt, response });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }
})

app.get('/tambahPetisi', (req, res) => {

    const urlProvinsi = "https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json";

    fetch(urlProvinsi)
    .then(response => response.json())
    .then(data => {
        res.render('tambahPetisi', { provinsi: data });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

})

app.get('/api/kabupaten', (req, res) => {
    const provinsiId = req.query.provinsiId;
    const urlKabupaten = `https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${provinsiId}.json`;
    
    fetch(urlKabupaten)
    .then(response => response.json())
    .then(data => {
        res.json(data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
})

app.get('/api/kecamatan', (req, res) => {
    const kabupatenId = req.query.kabupatenId;
    const urlKecamatan = `https://emsifa.github.io/api-wilayah-indonesia/api/districts/${kabupatenId}.json`;
    
    fetch(urlKecamatan)
    .then(response => response.json())
    .then(data => {
        res.json(data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
})

app.get('/api/kelurahan', (req, res) => {
    const kecamatanId = req.query.kecamatanId;
    const urlKelurahan = `https://emsifa.github.io/api-wilayah-indonesia/api/villages/${kecamatanId}.json`;
    
    fetch(urlKelurahan)
    .then(response => response.json())
    .then(data => {
        res.json(data);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
})

app.post('/tambahPetisi', async (req, res) => {
    const judulPetisi = req.body.namaPetisi;
    var tag = "";
    const isiPetisi = req.body.isiPetisi;

    const listTag = "(Ekonomi,Pendidikan,Kesehatan,Sosial,Budaya,Politik,Kebudayaan,Seni,Pariwisata,Keamanan,Keuangan)";

    const syntax = isiPetisi + "\nDari isi Teks diatas apakah tag yang cocok berdasarkan list tag berikut : " + listTag + "Jawab hanya menggunakan satu tag jika lebih dari satu tag pisahkan dengan koma";
    
    try {
        const prompt = req.body.prompt;
        
        const generate = async (textPrompt) => {
            try {
              const prompt = textPrompt;
              const result = await geminiModel.generateContent(prompt);
              const response = result.response;
              return response.text();
            } catch (error) {
              console.log("response error", error);
            }
          };
           
        var response = await generate(syntax);

        tag = response;

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate response' });
    }

    const kategoriTingkatan = req.body.kategoriTingkatan;
    const namaPengaju = req.body.namaPengaju;
    const lokasiPengajuan = `${req.body.provinsi}/${req.body.kabupaten}/${req.body.kecamatan}/${req.body.kelurahan}`;
    const jumlahDukungan = 0
    const jumlahLaporan = 0
    const statusAspirasi = "Menunggu"

    connection.query(`INSERT INTO petisi VALUES ('', '${judulPetisi}', '${tag}', '${isiPetisi}', '${kategoriTingkatan}', '${lokasiPengajuan}', '${namaPengaju}', '${jumlahDukungan}', '${jumlahLaporan}', '${statusAspirasi}')`, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    })
})

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
