import pool from "../src/database/DB.js";

async function migrate() {
  try {
    console.log("Starting database migration...");

    // 1. Rename columns in 'users'
    console.log("Renaming columns in 'users'...");
    await pool.query("ALTER TABLE users RENAME COLUMN id TO user_id");

    // 2. Rename columns in 'projects'
    console.log("Renaming columns in 'projects'...");
    await pool.query("ALTER TABLE projects RENAME COLUMN id TO project_id");
    await pool.query("ALTER TABLE projects RENAME COLUMN name TO project_name");

    // 3. Rename columns in 'files'
    console.log("Renaming columns in 'files'...");
    await pool.query("ALTER TABLE files RENAME COLUMN id TO file_id");
    await pool.query("ALTER TABLE files RENAME COLUMN name TO file_name");

    // 4. Create 'code_runs' table
    console.log("Creating 'code_runs' table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS code_runs (
          run_id      SERIAL PRIMARY KEY,
          file_id     INT REFERENCES files(file_id),
          user_id     INT REFERENCES users(user_id),
          language    VARCHAR(50),
          status      VARCHAR(20),
          output      TEXT,
          executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 5. Create 'activities' table
    console.log("Creating 'activities' table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
          activity_id SERIAL PRIMARY KEY,
          user_id     INT REFERENCES users(user_id),
          file_name   VARCHAR(255),
          language    VARCHAR(50),
          status      VARCHAR(20),
          created_at  TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log("Migration completed successfully!");
  } catch (err) {
    console.error("Migration FAILED:");
    console.error(err.message);
  } finally {
    process.exit(0);
  }
}

migrate();
