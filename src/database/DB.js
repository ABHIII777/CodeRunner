import { Pool } from "pg";

const pool = new Pool({
  user: "abhipatel",
  host: "localhost",
  port: 5432,
  database: "coderunnerdb"
});

export default pool;