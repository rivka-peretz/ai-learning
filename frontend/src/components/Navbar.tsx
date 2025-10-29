import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

/**
 * נאבאר מתקדם עם ניווט מלא למערכת AI Learning
 * תומך בזיהוי משתמש רגיל/מנהל ומציג תפריט מותאם
 */
const Navbar: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // הסתרת הנאבאר בעמודי ההתחברות והרישום
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  const handleLogout = (): void => {
    logout();
    navigate("/login");
  };

  // פונקציה לבדיקה אם הקישור פעיל
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <nav className="w-full bg-white/90 backdrop-blur-lg shadow-lg py-4 px-6 flex justify-between items-center fixed top-0 left-0 z-50 border-b border-white/20">
      {/* לוגו ושם המערכת */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate("/dashboard")}
        >
          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            <span className="text-white text-lg">🤖</span>
          </div>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI Learning
          </span>
        </div>
      </div>

      {/* תפריט ניווט */}
      <div className="flex items-center gap-8">
        {/* קישורים עיקריים */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isActive("/dashboard")
                ? "bg-indigo-100 text-indigo-700 shadow-md"
                : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            <span>🏠</span>
            דף הבית
          </button>

          <button
            onClick={() => navigate("/prompt")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isActive("/prompt")
                ? "bg-indigo-100 text-indigo-700 shadow-md"
                : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            <span>🤖</span>
            שאל את ה-AI
          </button>

          <button
            onClick={() => navigate("/history")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isActive("/history")
                ? "bg-indigo-100 text-indigo-700 shadow-md"
                : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
            }`}
          >
            <span>📚</span>
            היסטוריה
          </button>

          {/* קישור מנהל - רק למנהלים */}
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/AdminDashboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isActive("/AdminDashboard")
                  ? "bg-amber-100 text-amber-700 shadow-md"
                  : "text-gray-700 hover:text-amber-600 hover:bg-amber-50"
              }`}
            >
              <span>👩‍💼</span>
              לוח ניהול
            </button>
          )}
        </div>

        {/* פרטי משתמש ויציאה */}
        <div className="flex items-center gap-4 pl-6 border-r border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">
                {user?.role === 'admin' ? '👑' : '👤'}
              </span>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-800 text-sm">
                {user?.name || "אורח"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'מנהל מערכת' : 'תלמיד'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            <span className="flex items-center gap-2">
              <span>🚪</span>
              יציאה
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
