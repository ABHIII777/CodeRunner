import pool from "../src/database/DB.js";

const schema = `
CREATE TABLE IF NOT EXISTS users (
    user_id       SERIAL PRIMARY KEY,
    first_name    VARCHAR(50)  NOT NULL,
    last_name     VARCHAR(50)  NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    created_at    TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    project_id   SERIAL PRIMARY KEY,
    user_id      INT REFERENCES users(user_id),
    project_name VARCHAR(100) NOT NULL,
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS files (
    file_id    SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(project_id),
    file_name  VARCHAR(255) NOT NULL,
    language   VARCHAR(50),
    content    TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS code_runs (
    run_id      SERIAL PRIMARY KEY,
    file_id     INT REFERENCES files(file_id),
    user_id     INT REFERENCES users(user_id),
    language    VARCHAR(50),
    status      VARCHAR(20),
    output      TEXT,
    executed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activities (
    activity_id SERIAL PRIMARY KEY,
    user_id     INT REFERENCES users(user_id),
    file_name   VARCHAR(255),
    language    VARCHAR(50),
    status      VARCHAR(20),
    created_at  TIMESTAMP DEFAULT NOW()
);
`;

async function setup() {
  try {
    console.log("Applying schema...");
    await pool.query(schema);
    console.log("Schema applied successfully.");
  } catch (err) {
    console.error("Failed to apply schema:", err);
  } finally {
    process.exit(0);
  }
}

setup();
