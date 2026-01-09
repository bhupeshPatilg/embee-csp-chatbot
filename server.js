app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    const response = await fetch(
      process.env.AZURE_OPENAI_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.AZURE_OPENAI_KEY
        },
        body: JSON.stringify({
          model: process.env.AZURE_OPENAI_DEPLOYMENT,
          input: [
            {
              role: "user",
              content: [
                { type: "text", text: userMessage }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Azure OpenAI error:", data);
      return res.status(500).json({
        error: "Azure OpenAI error",
        details: data
      });
    }

    res.json({
      reply: data.output?.[0]?.content?.[0]?.text ?? "No response"
    });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
