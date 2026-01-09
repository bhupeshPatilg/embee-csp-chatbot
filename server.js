app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch(process.env.AZURE_OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_OPENAI_KEY
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Azure OpenAI error:", data);
      return res.status(500).json(data);
    }

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
