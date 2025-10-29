import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

pool.connect()
  .then(() => console.log(`✅ Connected to PostgreSQL at ${process.env.PGHOST}:${process.env.PGPORT}`))
  .catch(err => console.error("❌ Failed to connect to PostgreSQL:", err));

export default pool;
