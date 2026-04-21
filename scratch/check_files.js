import pool from "../src/database/DB.js";

async function checkFiles() {
  try {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'files'");
    console.log("Columns in 'files':", res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkFiles();
