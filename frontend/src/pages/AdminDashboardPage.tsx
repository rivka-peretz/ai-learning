import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchAllPromptsWithDetails } from "../api/api";

// Types
interface UserHistory {
  id: number;
  name: string;
  phone: string;
  category: string;
  subCategory: string;
  prompt: string;
  response: string;
  date: string;
}

/**
 * לוח ניהול מערכת - תצוגת מנהל של כל הפעילות במערכת
 * מציג נתונים אמתיים של משתמשים, שאלות ותשובות AI
 */
const AdminDashboardPage: React.FC = () => {
  // State management
  const [search, setSearch] = useState("");
  const [data, setData] = useState<UserHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * טעינת נתוני המערכת בטעינת הקומפוננטה
   */
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setLoading(true);
        const prompts = await fetchAllPromptsWithDetails();
        
        const formattedData: UserHistory[] = prompts.map(prompt => ({
          id: prompt.id,
          name: prompt.user_name,
          phone: prompt.user_phone,
          category: prompt.category_name || "כללי",
          subCategory: prompt.sub_category_name || "אחר",
          prompt: prompt.prompt,
          response: prompt.response || "אין תשובה",
          date: new Date(prompt.created_at).toLocaleDateString('he-IL')
        }));
        
        setData(formattedData);
      } catch (err) {
        console.error("Error loading admin data:", err);
        setError("שגיאה בטעינת הנתונים");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * סינון הנתונים לפי טקסט החיפוש
   */
  const filteredData = useMemo(() => {
    return data.filter(
      (item) =>
        item.name.includes(search) ||
        item.phone.includes(search) ||
        item.category.includes(search)
    );
  }, [search, data]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתוני מערכת...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center p-6 text-right">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-5xl p-8">

        {/* הודעת סטטוס */}
        <div className="mb-6 bg-indigo-100 border border-indigo-300 text-indigo-700 text-sm font-semibold rounded-lg px-4 py-2 text-center">
          <span>🔑 מחוברת כמנהלת מערכת</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          👩‍💼 לוח ניהול מערכת
        </h1>

        <div className="flex justify-between items-center mb-6">
          <input
            type="text"
            placeholder="חפשי לפי שם, פלאפון או קטגוריה..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-1/2 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-gray-600 font-medium">
            נמצאו {filteredData.length} רשומות
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm text-right">
            <thead>
              <tr className="bg-indigo-100 text-indigo-700">
                <th className="border p-2">שם</th>
                <th className="border p-2">פלאפון</th>
                <th className="border p-2">קטגוריה</th>
                <th className="border p-2">תת קטגוריה</th>
                <th className="border p-2">שאלה</th>
                <th className="border p-2">תשובה</th>
                <th className="border p-2">תאריך</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, idx) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-indigo-50"
                >
                  <td className="border p-2 font-semibold">{item.name}</td>
                  <td className="border p-2">{item.phone}</td>
                  <td className="border p-2">{item.category}</td>
                  <td className="border p-2">{item.subCategory}</td>
                  <td className="border p-2">{item.prompt}</td>
                  <td className="border p-2 text-gray-600">{item.response}</td>
                  <td className="border p-2 text-gray-500 text-xs">{item.date}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;