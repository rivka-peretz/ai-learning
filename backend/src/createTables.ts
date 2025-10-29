import pool from "./db";
const createTables = async () => {
  try {
    console.log("🚀 Creating tables...");
    // תחילה פונקציה ל־updated_at (כדי שתהיה זמינה גם לפני הטריגרים)
    await pool.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    // טבלת users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    // טבלת categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    // טבלת sub_categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sub_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT sub_categories_name_category_unique UNIQUE (name, category_id)
      );
    `);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS sub_categories_name_category_lower_idx
        ON sub_categories (LOWER(name), category_id);
    `);
    // טבלת prompts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prompts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        sub_category_id INTEGER REFERENCES sub_categories(id) ON DELETE SET NULL,
        prompt TEXT NOT NULL,
        response TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    // טריגרים לעדכון updated_at
    await pool.query(`
      DROP TRIGGER IF EXISTS users_set_updated_at ON users;
      CREATE TRIGGER users_set_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
    `);
    await pool.query(`
      DROP TRIGGER IF EXISTS categories_set_updated_at ON categories;
      CREATE TRIGGER categories_set_updated_at
      BEFORE UPDATE ON categories
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
    `);
    await pool.query(`
      DROP TRIGGER IF EXISTS sub_categories_set_updated_at ON sub_categories;
      CREATE TRIGGER sub_categories_set_updated_at
      BEFORE UPDATE ON sub_categories
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
    `);
    await pool.query(`
      DROP TRIGGER IF EXISTS prompts_set_updated_at ON prompts;
      CREATE TRIGGER prompts_set_updated_at
      BEFORE UPDATE ON prompts
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
    `);
    console.log("✅ All database tables created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create tables:", error);
    process.exit(1);
  }
};
createTables();