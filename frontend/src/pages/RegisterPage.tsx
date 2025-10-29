import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { createUser } from "../api/api";

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({ name: "", phone: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const { login } = useUser();

  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const phonePattern = /^(0?5[0-9]|0?[2-4]|0?7[0-9]|0?8|0?9)[0-9]{7,8}$/;
    return phonePattern.test(cleanPhone) && cleanPhone.length >= 9 && cleanPhone.length <= 10;
  };

  const validate = () => {
    const newErrors = { name: "", phone: "" };
    
    if (!name.trim()) {
      newErrors.name = "שדה חובה";
    }
    
    if (!phone.trim()) {
      newErrors.phone = "שדה חובה";
    } else if (!validatePhone(phone)) {
      newErrors.phone = "מספר פלאפון לא תקין. למשל: 050-1234567";
    }
    
    setErrors(newErrors);
    return !newErrors.name && !newErrors.phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validate()) return;

    try {
      const newUser = await createUser({ name, phone });

      const userWithRole = newUser as any;
      
      login(userWithRole);

      alert("נרשמת בהצלחה 🎉");
      navigate(userWithRole.role === "admin" ? "/AdminDashboard" : "/dashboard");
    } catch (err) {
      console.error(err);
      
      if (err instanceof Error && err.message.includes('409')) {
        setErrorMsg("השם והפלאפון כבר רשומים במערכת! עבור להתחברות");
      } else {
        setErrorMsg("שגיאה בהרשמה. ייתכן שהפלאפון כבר רשום במערכת 📱");
      }
    }
  };

  const isFormValid = name && phone;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800">הרשמה עם פלאפון 📱</h1>

        <form onSubmit={handleSubmit} className="space-y-5 text-right">
          <div>
            <label className="block text-gray-600 mb-1 font-medium">שם מלא</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="הכניסי את שמך המלא"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">פלאפון</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => {
                if (phone && !validatePhone(phone)) {
                  setErrors(prev => ({...prev, phone: "מספר פלאפון לא תקין. למשל: 050-1234567"}));
                } else {
                  setErrors(prev => ({...prev, phone: ""}));
                }
              }}
              className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="050-1234567"
              pattern="[0-9\-\s]+"
              title="מספר פלאפון ישראלי: 050-1234567"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {errorMsg && (
            <div className="text-red-600 text-sm font-semibold mt-2 bg-red-50 p-2 rounded-lg text-center">
              <p>{errorMsg}</p>
              {errorMsg.includes('כבר רשומים') && (
                <div className="mt-2">
                  <a 
                    href="/login" 
                    className="text-indigo-600 hover:text-indigo-800 underline font-bold"
                  >
                    👈 לחץ כאן להתחברות
                  </a>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              isFormValid
                ? "bg-indigo-600 hover:bg-indigo-700 shadow-md"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            הירשם
          </button>
        </form>

        <p className="text-sm text-gray-700 mt-6">
          יש לך כבר משתמש?{" "}
          <a href="/login" className="text-indigo-600 font-semibold hover:underline">
            התחברות
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
