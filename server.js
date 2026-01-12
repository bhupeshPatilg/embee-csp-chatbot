import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 8080;

/* ---------- ES MODULE FIX ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* ---------- HEALTH CHECK ---------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ---------- CHAT API ---------- */
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiKey = process.env.AZURE_OPENAI_KEY;

    if (!endpoint || !deployment || !apiKey) {
      console.error("Missing Azure OpenAI configuration");
      return res.status(500).json({ error: "Azure OpenAI not configured" });
    }

    /* ✅ CORRECT URL */
    const url = `${endpoint}/openai/deployments/${deployment}/responses?api-version=2025-04-01-preview`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        input: message,
        max_output_tokens: 800
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Azure OpenAI ERROR:", data);
      return res.status(500).json({ error: data });
    }

    const reply =
      data?.output_text ||
      data?.output?.[0]?.content?.[0]?.text ||
      "No response from model";

    res.json({ reply });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ---------- FRONTEND ---------- */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ---------- START ---------- */
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
