import express from "express"
import cors from "cors"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import pool from "../database/DB.js"
import { fileURLToPath } from "url"
import { dirname, resolve } from "path"

// Resolve .env from project root regardless of where the server is launched from
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, "../../.env") })

// Debug: confirm key loaded (shows first 8 chars only)
console.log("[ENV] GROQ_API_KEY loaded:", process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.slice(0, 8)}...` : "❌ NOT FOUND")

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret"

app.use(cors())
app.use(express.json())

// --- Middleware ---

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.status(401).json({ message: "Access token required" })

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" })
    req.user = user
    next()
  })
}

// --- Auth Endpoints ---

app.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await pool.query(
      "SELECT 1 FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING user_id, email, first_name",
      [firstName, lastName, email, hashPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ 
      message: "User created.",
      token,
      user: { id: user.user_id, email: user.email, firstName: user.first_name }
    });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT user_id, email, first_name, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const token = jwt.sign({ userId: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({ 
      message: "Login successful.",
      token,
      user: { id: user.user_id, email: user.email, firstName: user.first_name }
    });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// --- Projects Endpoints ---

app.get("/projects", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

app.post("/projects", authenticateToken, async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO projects (user_id, project_name) VALUES ($1, $2) RETURNING *",
      [req.user.userId, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

app.delete("/projects/:id", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM projects WHERE project_id = $1 AND user_id = $2", [req.params.id, req.user.userId]);
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

// --- Files Endpoints ---

app.get("/projects/:projectId/files", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM files WHERE project_id = $1 ORDER BY created_at ASC",
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

app.post("/projects/:projectId/files", authenticateToken, async (req, res) => {
  const { name, language, content } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO files (project_id, file_name, language, content) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.params.projectId, name, language, content || ""]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

app.post("/projects/:projectId/files/bulk", authenticateToken, async (req, res) => {
  const { files } = req.body;
  const projectId = req.params.projectId;

  if (!Array.isArray(files)) {
    return res.status(400).json({ message: "Invalid payload, expected 'files' array" });
  }

  try {
    const results = [];
    for (const file of files) {
      const result = await pool.query(
        "INSERT INTO files (project_id, file_name, language, content) VALUES ($1, $2, $3, $4) RETURNING *",
        [projectId, file.name, file.language, file.content || ""]
      );
      results.push(result.rows[0]);
    }
    res.status(201).json(results);
  } catch (err) {
    res.status(500).json({ message: "Database bulk insert error", error: err.message });
  }
});

app.put("/files/:id", authenticateToken, async (req, res) => {
  const { content, fileName, language } = req.body;
  try {
    const result = await pool.query(
      "UPDATE files SET content = COALESCE($1, content), file_name = COALESCE($2, file_name), language = COALESCE($3, language) WHERE file_id = $4 RETURNING *",
      [content, fileName, language, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

app.delete("/files/:id", authenticateToken, async (req, res) => {
  try {
    await pool.query("DELETE FROM files WHERE file_id = $1", [req.params.id]);
    res.json({ message: "File deleted" });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

import { exec } from "child_process"
import fs from "fs"
import path from "path"
import { promisify } from "util"

const execPromise = promisify(exec);
const TEMP_DIR = path.join(process.cwd(), "temp_exec");

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

app.post("/run", authenticateToken, async (req, res) => {
  const { fileId, language, content } = req.body;
  const userId = req.user.userId;

  const timestamp = Date.now();
  const fileName = `exec_${timestamp}`;
  let filePath = "";
  let command = "";

  try {
    if (language === "python") {
      filePath = path.join(TEMP_DIR, `${fileName}.py`);
      await fs.promises.writeFile(filePath, content);
      command = `python3 "${filePath}"`;
    } else if (language === "javascript") {
      filePath = path.join(TEMP_DIR, `${fileName}.js`);
      await fs.promises.writeFile(filePath, content);
      command = `node "${filePath}"`;
    } else if (language === "cpp") {
      const sourcePath = path.join(TEMP_DIR, `${fileName}.cpp`);
      const binaryPath = path.join(TEMP_DIR, `${fileName}`);
      await fs.promises.writeFile(sourcePath, content);
      // Compile and then run
      command = `g++ "${sourcePath}" -o "${binaryPath}" && "${binaryPath}"`;
      filePath = sourcePath; // For cleanup later (binary needs cleanup too)
    } else {
      return res.status(400).json({ message: "Unsupported language for local execution" });
    }

    let output = "";
    let status = "Passed";

    try {
      const { stdout, stderr } = await execPromise(command, { timeout: 5000 });
      output = stdout || stderr || "No output";
    } catch (error) {
      status = "Failed";
      output = error.stderr || error.stdout || error.message;
    }

    // Database logging
    await pool.query(
      "INSERT INTO code_runs (file_id, user_id, language, status, output) VALUES ($1, $2, $3, $4, $5)",
      [fileId, userId, language, status, output]
    );

    const fileResult = await pool.query("SELECT file_name FROM files WHERE file_id = $1", [fileId]);
    const originalFileName = fileResult.rows[0]?.file_name || "Unknown";

    await pool.query(
      "INSERT INTO activities (user_id, file_name, language, status) VALUES ($1, $2, $3, $4)",
      [userId, originalFileName, language, status]
    );

    // Cleanup temp files
    try {
      if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
      const binaryPath = filePath.replace(".cpp", "");
      if (language === "cpp" && fs.existsSync(binaryPath)) await fs.promises.unlink(binaryPath);
    } catch (cleanupErr) {
      console.error("Cleanup error:", cleanupErr);
    }

    res.json({ output, status, time: "Local" });
  } catch (err) {
    console.error("Local execution error:", err);
    res.status(500).json({ message: "Local execution error", error: err.message });
  }
});

app.get("/activities", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM activities WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

app.get("/recent-runs", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT r.*, f.file_name FROM code_runs r JOIN files f ON r.file_id = f.file_id WHERE r.user_id = $1 ORDER BY r.executed_at DESC LIMIT 5",
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
});

app.post("/suggest", authenticateToken, async (req, res) => {
  const { prompt, language } = req.body;
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === "your_groq_api_key_here") {
    return res.status(400).json({ message: "Groq API Key is missing in .env" });
  }

  if (!prompt || prompt.trim().length < 2) {
    return res.json({ suggestions: [] });
  }

  try {
    const systemPrompt = `You are an expert ${language} code auto-completion engine.
    CONTEXT: The user is typing code.
    TASK: Provide the NEXT lines of code to complete the thought.
    RULES:
    - RETURN ONLY THE CODE. 
    - NO Markdown, NO backticks, NO explanations.
    - If you cannot provide a completion, return an empty string.`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0,
        max_tokens: 100
      })
    });

    if (!groqRes.ok) {
        const errorData = await groqRes.json();
        throw new Error(errorData.error?.message || "Groq request failed");
    }

    const data = await groqRes.json();
    let text = data.choices[0].message.content.trim();
    
    // Minimal cleanup: remove accidental markdown
    text = text.replace(/^```[a-z]*\n/i, "").replace(/\n```$/g, "").replace(/```/g, "");

    if (!text) {
      return res.json({ suggestions: [] });
    }

    // Wrap the single best completion in an array for frontend compatibility
    res.json({ suggestions: [text] });
  } catch (err) {
    console.error("Groq error:", err.message);
    res.status(500).json({ message: "AI Suggestion error", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
})