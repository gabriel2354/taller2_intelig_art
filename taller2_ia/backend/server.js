import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch"; // npm install node-fetch
import FormData from "form-data"; // npm install form-data

dotenv.config();

const app = express();

// =========================
// 📌 CORS
// =========================
app.use(
  cors({
    origin: ["http://localhost:4200"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const upload = multer({ dest: "uploads/" });

// =========================
// ✅ 0. Healthcheck (para PyTest)
// =========================
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "backend",
    timestamp: new Date().toISOString(),
  });
});

// =========================
// 📌 1. Chat de texto
// =========================
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res
        .status(400)
        .json({ error: "El campo 'message' es obligatorio" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res
        .status(500)
        .json({ error: "Falta la API key de OpenAI en .env" });
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Eres un asistente virtual experto en videojuegos.",
            },
            { role: "user", content: message },
          ],
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Error de OpenAI:", data.error);
      return res
        .status(500)
        .json({ error: data.error.message || "Error en OpenAI" });
    }

    const text = data?.choices?.[0]?.message?.content || "Sin respuesta";

    // Devolvemos ambas claves para más compatibilidad con pruebas/front
    res.json({ reply: text, respuesta: text });
  } catch (err) {
    console.error("Error en /chat:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// =========================
// 📌 2. Análisis de imagen
// =========================
app.post("/analizar-imagen", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ninguna imagen" });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString("base64");

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Describe la imagen en detalle." },
                {
                  type: "image_url",
                  image_url: { url: `data:image/jpeg;base64,${base64Image}` },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    fs.unlinkSync(req.file.path);

    if (data.error) {
      console.error("Error de OpenAI:", data.error);
      return res
        .status(500)
        .json({ error: data.error.message || "Error en OpenAI" });
    }

    res.json({
      descripcion:
        data.choices?.[0]?.message?.content || "No pude analizar la imagen",
    });
  } catch (err) {
    console.error("Error en /analizar-imagen:", err);
    res.status(500).json({ error: "Error al analizar imagen" });
  }
});

// =========================
// 📌 3. Transcripción de audio
// =========================
app.post("/voz-a-texto", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envió ningún audio" });
    }

    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));
    form.append("model", "gpt-4o-mini-transcribe");

    const response = await fetch(
      "https://api.openai.com/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: form,
      }
    );

    const data = await response.json();
    fs.unlinkSync(req.file.path);

    if (data.error) {
      console.error("Error de OpenAI:", data.error);
      return res
        .status(500)
        .json({ error: data.error.message || "Error en OpenAI" });
    }

    res.json({ texto: data.text || "No se pudo transcribir el audio" });
  } catch (err) {
    console.error("Error en /voz-a-texto:", err);
    res.status(500).json({ error: "Error al procesar audio" });
  }
});

// =========================
// 📌 4. Generación de imágenes
// =========================
app.post("/generar-imagen", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "El campo 'prompt' es obligatorio" });
    }

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt,
          size: "512x512",
          n: 1,
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Error de OpenAI:", data.error);
      return res
        .status(500)
        .json({ error: data.error.message || "Error en OpenAI" });
    }

    res.json({ url: data.data?.[0]?.url || null });
  } catch (err) {
    console.error("Error en /generar-imagen:", err);
    res.status(500).json({ error: "Error al generar imagen" });
  }
});

// =========================
// 🚀 Iniciar servidor
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor listo en http://localhost:${PORT}`);
});
