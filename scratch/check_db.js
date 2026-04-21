import pool from "./src/database/DB.js";

async function checkDB() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    console.log("Tables in DB:", res.rows.map(r => r.table_name));
    process.exit(0);
  } catch (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
}

checkDB();
