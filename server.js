import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await axios.post(
      `${endpoint}/openai/responses?api-version=2025-04-01-preview`,
      {
        model: deployment,
        input: [
          {
            role: "user",
            content: [{ type: "text", text: userMessage }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": apiKey
        }
      }
    );

    res.json({
      reply: response.data.output_text || "No response"
    });

  } catch (err) {
    console.error("Azure OpenAI ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Azure OpenAI error" });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Running on port ${port}`));
