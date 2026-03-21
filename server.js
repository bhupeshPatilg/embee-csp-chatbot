const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, ".")));

// 🔴 YOUR AZURE OPENAI DETAILS
const endpoint = "https://bhupe-mkeacfjd-eastus2.cognitiveservices.azure.com";
const deployment = "gpt-4o_csp_chabot";
const apiVersion = "2025-01-01-preview";

// ⚠️ PASTE YOUR KEY BELOW (locally only, not in public repo)
const apiKey = "DvjfcnHEa9xX6EHPxrbcdbxRx8UbLzVzmVC1kjVm6Kfq1smbNTlDJQQJ99CAACHYHv6XJ3w3AAAAACOGPLWs";

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        const response = await axios.post(
            `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
            {
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 300,
                temperature: 0.7
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": apiKey
                }
            }
        );

        const reply = response.data.choices[0].message.content;
        res.json({ reply });

    } catch (error) {
        console.error("ERROR:", error.response?.data || error.message);
        res.status(500).send("Error calling Azure OpenAI");
    }
});

// Load UI
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Azure port handling
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
