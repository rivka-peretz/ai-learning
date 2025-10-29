import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { loginUser } from "../api/api";

/**
 * דף התחברות עם וידוא שם ופלאפון
 * תומך בוידוא מנהל על בסיס מספר פלאפון ייעודי
 */
const LoginPage: React.FC = () => {
  // State management
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({ name: "", phone: "" });
  const [serverError, setServerError] = useState("");
  
  // Hooks
  const { login } = useUser();
  const navigate = useNavigate();

  /**
   * וידוא שם מלא - לפחות 2 תווים
   */
  const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  /**
   * וידוא פלאפון ישראלי תקין
   * תומך בפורמטים שונים של מספרי פלאפון ישראליים
   */
  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const phonePattern = /^(0?5[0-9]|0?[2-4]|0?7[0-9]|0?8|0?9)[0-9]{7,8}$/;
    return phonePattern.test(cleanPhone) && cleanPhone.length >= 9 && cleanPhone.length <= 10;
  };

  /**
   * ווידוא כל השדות בטופס
   */
  const validate = (): boolean => {
    const newErrors = { name: "", phone: "" };
    
    if (!name.trim()) {
      newErrors.name = "שדה חובה";
    } else if (!validateName(name)) {
      newErrors.name = "שם מלא חייב להכיל לפחות 2 תווים";
    }

    if (!phone.trim()) {
      newErrors.phone = "שדה חובה";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "מספר פלאפון לא תקין";
    }
    
    setErrors(newErrors);
    return !newErrors.name && !newErrors.phone;
  };

  /**
   * טיפול בשליחת הטופס - התחברות למערכת
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!validate()) return;

    setServerError("");

    try {
      const user = await loginUser(name, phone);

      if (!user) {
        setServerError("השם המלא או מספר הפלאפון לא נמצאו במערכת 📱");
        return;
      }

      const userWithRole = user as any;
      
      login(userWithRole);
      alert(`נכנסת בהצלחה כ${userWithRole.role === 'admin' ? 'מנהל' : 'תלמיד'} ✅`);

      // הפניה לדף מתאים לפי סוג המשתמש
      const targetRoute = userWithRole.role === "admin" ? "/AdminDashboard" : "/dashboard";
      
      setTimeout(() => {
        navigate(targetRoute);
      }, 100);

    } catch (err) {
      if (err instanceof Error && err.message.includes('401')) {
        setServerError("אופס! לא מצאנו אותך במערכת 😔 בדוק שהפרטים נכונים או הירשם כדי להיכנס למערכת 👇");
      } else {
        setServerError("שגיאה בשרת, נסה שוב מאוחר יותר.");
      }
    }
  };

  const isFormValid = name && phone;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-yellow-300 opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md text-center relative z-10 backdrop-blur-sm bg-opacity-95 border border-white border-opacity-20">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🎓</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            כניסה למערכת
          </h1>
          <p className="text-gray-500 mt-2">שם מלא ופלאפון לכניסה מהירה</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-right">
          <div className="group">
            <label className="block text-gray-600 mb-2 font-medium text-sm">שם מלא</label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => {
                  if (name && !validateName(name)) {
                    setErrors(prev => ({...prev, name: "שם מלא חייב להכיל לפחות 2 תווים"}));
                  } else {
                    setErrors(prev => ({...prev, name: ""}));
                  }
                }}
                className={`w-full border rounded-xl p-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 ${
                  errors.name ? "border-red-500 bg-red-50" : "border-gray-300 group-hover:border-indigo-300"
                }`}
                placeholder="למשל: שרה כהן"
              />
              <div className="absolute right-3 top-3 text-gray-400">
                <span>👤</span>
              </div>
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.name}</p>
            )}
          </div>

          <div className="group">
            <label className="block text-gray-600 mb-2 font-medium text-sm">פלאפון</label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => {
                  if (phone && !validatePhone(phone)) {
                    setErrors(prev => ({...prev, phone: "מספר פלאפון לא תקין"}));
                  } else {
                    setErrors(prev => ({...prev, phone: ""}));
                  }
                }}
                className={`w-full border rounded-xl p-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200 ${
                  errors.phone ? "border-red-500 bg-red-50" : "border-gray-300 group-hover:border-indigo-300"
                }`}
                placeholder="050-1234567"
                pattern="[0-9\-\s]+"
                title="מספר פלאפון ישראלי"
              />
              <div className="absolute right-3 top-3 text-gray-400">
                <span>📱</span>
              </div>
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1 animate-fadeIn">{errors.phone}</p>
            )}
          </div>

          {serverError && (
            <div className="text-red-500 font-medium text-center bg-red-50 p-4 rounded-xl border border-red-200 animate-slideDown">
              <p className="mb-2">{serverError}</p>
              {serverError.includes('לא מצאנו אותך') && (
                <div className="mt-3">
                  <a 
                    href="/register" 
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-bold transition-colors duration-200 hover:underline"
                  >
                    <span className="ml-2">👈</span>
                    לחץ כאן להרשמה
                  </a>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 transform ${
              isFormValid
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {isFormValid ? (
              <span className="flex items-center justify-center">
                <span className="ml-2">🚀</span>
                התחבר
              </span>
            ) : (
              "מלא את הפרטים"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">חדש במערכת? 🌟</p>
          <a 
            href="/register" 
            className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-800 transition-colors duration-200 hover:underline"
          >
            <span className="ml-2">✨</span>
            בוא נרשום אותך!
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
