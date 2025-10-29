import React from "react";
import { useUser } from "../context/UserContext";

const HistoryPage: React.FC = () => {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white text-2xl">
        אין משתמש מחובר 😅
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl text-right">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          📘 היסטוריית למידה של {user.name}
        </h1>

        {user.history.length === 0 ? (
          <p className="text-gray-600 text-center">אין היסטוריה להצגה עדיין 😅</p>
        ) : (
          <div className="space-y-4">
            {user.history.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                <p className="text-sm text-gray-500">
                  {item.category} › {item.subCategory} | {item.date}
                </p>
                <p className="font-semibold text-gray-800 mt-1">
                  ❓ {item.prompt}
                </p>
                <p className="text-gray-700 mt-2 bg-gray-50 p-2 rounded-lg">
                  💡 {item.response}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
