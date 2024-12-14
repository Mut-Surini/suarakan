import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import bp from 'body-parser';

// Initialize environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bp.json()); // For JSON payloads
app.use(bp.urlencoded({ extended: true })); // For form payloads

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
    res.render('tambahPetisi');
})

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
