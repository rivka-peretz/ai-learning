import pool from "./db";

const seedData = async () => {
  console.log("Seeding full categories and subcategories...");

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ננקה את הטבלאות הקיימות
    await client.query(`
      TRUNCATE TABLE prompts RESTART IDENTITY CASCADE;
      TRUNCATE TABLE sub_categories RESTART IDENTITY CASCADE;
      TRUNCATE TABLE categories RESTART IDENTITY CASCADE;
      TRUNCATE TABLE users RESTART IDENTITY CASCADE;
    `);

    // משתמש לדוגמה
    const userResult = await client.query(
      `INSERT INTO users (name, phone)
       VALUES ($1, $2)
       RETURNING id`,
      ["רבקה פרץ", "050-0000000"]
    );
    const userId = userResult.rows[0].id as number;

    // כל הקטגוריות
    const categoryNames = [
      "מתמטיקה",
      "אנגלית",
      "מדעים",
      "טכנולוגיה",
      "היסטוריה ואזרחות",
      "ספרות ולשון",
      "כללי",
      "יצירה וחשיבה",
    ];

    // נכניס את הקטגוריות
    const categoryRows = await client.query(
      `INSERT INTO categories (name)
       VALUES ${categoryNames.map((_, i) => `($${i + 1})`).join(",")}
       RETURNING id, name`,
      categoryNames
    );

    const categories = Object.fromEntries(
      categoryRows.rows.map((row) => [row.name, row.id])
    );

    // תתי קטגוריות לפי כל קטגוריה
    const subCategoriesData = [
      // מתמטיקה
      ["חיבור וחיסור", "מתמטיקה"],
      ["שברים ואחוזים", "מתמטיקה"],
      ["אלגברה", "מתמטיקה"],
      ["הנדסה וגיאומטריה", "מתמטיקה"],
      ["בעיות מילוליות", "מתמטיקה"],

      // אנגלית
      ["Grammar", "אנגלית"],
      ["Vocabulary", "אנגלית"],
      ["Reading comprehension", "אנגלית"],
      ["Speaking", "אנגלית"],
      ["Writing", "אנגלית"],

      // מדעים
      ["פיזיקה", "מדעים"],
      ["כימיה", "מדעים"],
      ["ביולוגיה", "מדעים"],
      ["אקולוגיה", "מדעים"],

      // טכנולוגיה
      ["תכנות בסיסי", "טכנולוגיה"],
      ["אינטליגנציה מלאכותית", "טכנולוגיה"],
      ["סייבר ואבטחת מידע", "טכנולוגיה"],
      ["רובוטיקה", "טכנולוגיה"],
      ["עולם האינטרנט", "טכנולוגיה"],

      // היסטוריה ואזרחות
      ["תולדות עם ישראל", "היסטוריה ואזרחות"],
      ["היסטוריה כללית", "היסטוריה ואזרחות"],
      ["מדינת ישראל", "היסטוריה ואזרחות"],
      ["ערכים וזכויות", "היסטוריה ואזרחות"],

      // ספרות ולשון
      ["ניתוח טקסטים", "ספרות ולשון"],
      ["אוצר מילים", "ספרות ולשון"],
      ["כתיבת חיבור", "ספרות ולשון"],

      // כללי
      ["טריוויה", "כללי"],
      ["תרבות כללית", "כללי"],
      ["מסעות בעולם", "כללי"],
      ["חידונים", "כללי"],
      ["מדע פופולרי", "כללי"],

      // יצירה וחשיבה
      ["חשיבה יצירתית", "יצירה וחשיבה"],
      ["פיתוח רעיונות", "יצירה וחשיבה"],
      ["אמנות ועיצוב", "יצירה וחשיבה"],
      ["פתרון בעיות", "יצירה וחשיבה"],
    ];

    for (const [name, catName] of subCategoriesData) {
      const categoryId = categories[catName];
      await client.query(
        `INSERT INTO sub_categories (name, category_id) VALUES ($1, $2)`,
        [name, categoryId]
      );
    }

    // נוסיף פרומפט לדוגמה אחד
    await client.query(
      `INSERT INTO prompts (user_id, category_id, sub_category_id, prompt, response)
       VALUES ($1, $2, NULL, $3, $4)`,
      [
        userId,
        categories["טכנולוגיה"],
        "מה זה אינטליגנציה מלאכותית?",
        "אינטליגנציה מלאכותית היא תחום במדעי המחשב העוסק בפיתוח מערכות שיכולות ללמוד, לחשוב, ולפתור בעיות בדומה לבני אדם."
      ]
    );

    await client.query("COMMIT");
    console.log("✅ קטגוריות ותתי קטגוריות נזרעו בהצלחה!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ שגיאה בזמן הכנסת הדאטה:", error);
  } finally {
    client.release();
  }
};

seedData()
  .then(() => pool.end())
  .catch((error) => {
    console.error(error);
    pool.end();
  });
