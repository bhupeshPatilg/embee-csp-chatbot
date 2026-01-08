const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
const model = process.env.AZURE_OPENAI_MODEL;

app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await axios.post(
      `${endpoint}/openai/responses?api-version=${apiVersion}`,
      {
        model: model,
        input: userMessage
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      reply: response.data.output_text
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ reply: "Azure OpenAI error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on port ${port}`));
