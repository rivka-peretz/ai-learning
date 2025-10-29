import React, { useEffect, useState } from "react";
import { fetchCategories } from "../api/api";

interface Category {
  id: number;
  name: string;
}

const CategorySelect: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error("❌ Failed to load categories", err);
      }
    };
    loadCategories();
  }, []);

  return (
    <select
      className="border p-2 rounded"
      value={selectedCategory ?? ""}
      onChange={(e) => setSelectedCategory(Number(e.target.value))}
    >
      <option value="">בחר קטגוריה</option>
      {categories.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
};

export default CategorySelect;
