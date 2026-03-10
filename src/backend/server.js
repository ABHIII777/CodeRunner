import express from "express"
import cors from "cors"

let PORT = 3000

const app = express()
app.use(cors())
app.use(express.json())


app.post("/login", async (req, res) => {
  console.log("This is Express server speaking...");
  const data = req.body;

  console.log("This email and password is from server....")
  console.log(data);

  res.json({ message: "Data received", data });
})

app.post("/signup", async (req, res) => {
  console.log("This is express server speaking...");
  const data = req.body;

  res.json({ message: "Data received", data });
})

app.listen(PORT, () => {
  console.log("Server is listening on port 3000");
})