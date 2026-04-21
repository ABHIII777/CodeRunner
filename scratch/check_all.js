import pool from "../src/database/DB.js";

async function checkAll() {
  try {
    const users = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    const projects = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'projects'");
    console.log("Users:", users.rows.map(r => r.column_name));
    console.log("Projects:", projects.rows.map(r => r.column_name));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
checkAll();
