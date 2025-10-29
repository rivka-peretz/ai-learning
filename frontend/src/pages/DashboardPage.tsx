import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { motion } from "framer-motion";

const DashboardPage: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-full max-w-xl text-right border border-white/40"
      >
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4 text-center">
          🌟 שלום {user?.name || "תלמידה"}!
        </h1>

        <p className="text-gray-700 text-center mb-8 leading-relaxed">
          ברוכה הבאה ללוח הבקרה שלך!  
          מכאן תוכלי להתחיל שיעור חדש, לעיין בהיסטוריה שלך, או להתנתק מהמערכת.
        </p>

        <div className="flex flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/prompt")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold shadow-md transition"
          >
            🚀 התחילי למידה חדשה
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/history")}
            className="bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-semibold shadow-md transition"
          >
            📚 היסטוריית למידה
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-xl font-semibold shadow-md transition"
          >
            🚪 התנתקות
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
