import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

// Cargar variables de entorno
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "El campo 'message' es obligatorio" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "API key no configurada en el servidor" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Eres un asistente virtual experto en videojuegos." },
          { role: "user", content: message }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const data = await response.json();

    // Verificar si hubo error desde OpenAI
    if (!data.choices || !data.choices.length) {
      console.error("Error en la respuesta de OpenAI:", data);
      return res.status(500).json({ error: "No se pudo generar una respuesta desde OpenAI" });
    }

    res.json({ reply: data.choices[0].message.content.trim() });

  } catch (err) {
    console.error("Error en /chat:", err);
    res.status(500).json({ error: "Error al conectar con OpenAI" });
  }
});

app.listen(3000, () => console.log("✅ Servidor en http://localhost:3000"));
