const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(__dirname));

// 🔴 CONFIG (DO NOT CHANGE FORMAT)
const endpoint = "https://bhupe-mkeacfjd-eastus2.cognitiveservices.azure.com/openai/deployments/gpt-4o_csp_chabot/chat/completions?api-version=2025-01-01-preview";
const deployment = "gpt-4o_csp_chabot";
const apiVersion = "2024-02-15-preview";

// 👉 PASTE YOUR KEY HERE
const apiKey = "DvjfcnHEa9xX6EHPxrbcdbxRx8UbLzVzmVC1kjVm6Kfq1smbNTlDJQQJ99CAACHYHv6XJ3w3AAAAACOGPLWs";

app.post("/chat", async (req, res) => {
    try {
        const userMessage = req.body.message;

        // ✅ Build URL properly
        const url =
            endpoint +
            "/openai/deployments/" +
            deployment +
            "/chat/completions?api-version=" +
            apiVersion;

        console.log("FINAL URL:", url);

        const response = await axios({
            method: "post",
            url: url,
            headers: {
                "Content-Type": "application/json",
                "api-key": apiKey
            },
            data: {
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 200
            }
        });

        res.json({ reply: response.data.choices[0].message.content });

    } catch (error) {
        console.error("FULL ERROR:", error);
        res.status(500).send("Azure OpenAI error");
    }
});

// Default route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Running on port " + PORT));
