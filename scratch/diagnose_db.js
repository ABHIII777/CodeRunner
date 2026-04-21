import pool from "../src/database/DB.js";

async function diagnose() {
  try {
    console.log("Checking DB connection...");
    const timeRes = await pool.query("SELECT NOW()");
    console.log("Connection successful! Server time:", timeRes.rows[0].now);

    console.log("Checking tables...");
    const tableRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    const tables = tableRes.rows.map(r => r.table_name);
    console.log("Tables found:", tables);

    const requiredTables = ['users', 'projects', 'files', 'code_runs', 'activities'];
    const missing = requiredTables.filter(t => !tables.includes(t));

    if (missing.length > 0) {
      console.error("Missing tables:", missing);
    } else {
      console.log("All required tables are present.");
    }

  } catch (err) {
    console.error("DIAGNOSIS FAILED:");
    console.error("Error Code:", err.code);
    console.error("Message:", err.message);
    if (err.code === '3D000') {
      console.error("Hint: The database 'coderunnerdb' does not exist.");
    } else if (err.code === '28P01') {
      console.error("Hint: Password authentication failed for user.");
    }
  } finally {
    process.exit(0);
  }
}

diagnose();
