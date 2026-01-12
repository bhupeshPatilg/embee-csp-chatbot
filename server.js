import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 8080;

/* ---------- Required for ES Modules ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------- Middleware ---------- */
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ---------- Health Check ---------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ---------- CHAT API (GPT-5 RESPONSES API) ---------- */
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    /* ---------- ENV VALIDATION ---------- */
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_KEY;

    if (!endpoint || !apiKey) {
      console.error("Missing Azure OpenAI environment variables");
      return res.status(500).json({ error: "Azure OpenAI not configured" });
    }

    /* ---------- CALL AZURE OPENAI (RESPONSES API) ---------- */
    const azureResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        input: userMessage,
        max_output_tokens: 800
      })
    });

    const data = await azureResponse.json();

    if (!azureResponse.ok) {
      console.error("Azure OpenAI error:", data);
      return res.status(500).json({ error: "Azure OpenAI error", details: data });
    }

    /* ---------- EXTRACT TEXT SAFELY ---------- */
    const reply =
      data?.output_text ||
      data?.output?.[0]?.content?.[0]?.text ||
      "No response from Azure OpenAI";

    res.json({ reply });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ---------- FRONTEND ROUTE ---------- */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ---------- START SERVER ---------- */
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
