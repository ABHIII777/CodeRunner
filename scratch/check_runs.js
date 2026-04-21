import pool from "../src/database/DB.js";

async function checkColumns() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'runs'");
    console.log("Columns in 'runs':", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkColumns();
