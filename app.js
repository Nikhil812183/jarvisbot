require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                messages,
                model: "llama3-70b-8192",
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 1,
                stream: false,
                stop: null,
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const completion = response.data;
        const botResponse = completion.choices[0]?.message?.content || "I couldn't generate a response.";
        
        res.json({ 
            response: botResponse,
            tokensUsed: completion.usage?.total_tokens || 0
        });
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        res.status(500).json({ 
            error: "An error occurred",
            details: error.response?.data || error.message 
        });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`JARVIS AI Assistant running at http://localhost:${port}`);
});