import express from "express"
import cors from "cors"
import bcrypt from "bcrypt"
import pool from "../database/DB.js"

let PORT = 3000

const app = express()
app.use(cors())
app.use(express.json())


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const dataFeed = await pool.query(
    "SELECT password_hash FROM users WHERE email = $1",
    [email]
  );

  if (dataFeed.rows.length === 0) {
    return res.status(404).json({ message: "User not found." });
  }

  const isValid = await bcrypt.compare(
    password,
    dataFeed.rows[0].password_hash
  );

  if (isValid) {
    res.status(200).json({ message: "Login successful." });
  } else {
    res.status(401).json({ message: "Invalid password." });
  }
});

app.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  const existingUser = await pool.query(
    "SELECT 1 FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rows.length > 0) {
    return res.status(409).json({ message: "User already exists." });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  await pool.query(
    "INSERT INTO users (first_name, last_name, email, password_hash, created_at) VALUES ($1, $2, $3, $4, $5)",
    [firstName, lastName, email, hashPassword, new Date()]
  );

  res.status(201).json({ message: "User created." });
});

app.listen(PORT, () => {
  console.log("Server is listening on port 3000");
})