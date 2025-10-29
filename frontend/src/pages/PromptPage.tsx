import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { fetchCategories, fetchSubCategories, addPrompt } from "../api/api";

// Types
interface Category {
    id: number;
    name: string;
}

interface SubCategory {
    id: number;
    name: string;
    category_id: number;
}

/**
 * דף שליחת שאלות ל-AI
 * כולל בחירת קטגוריה, תת-קטגוריה ושליחת פרומפט
 */
const PromptPage: React.FC = () => {
    // Hooks
    const { addToHistory, user } = useUser();
    
    // State management
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [category, setCategory] = useState("");
    const [subCategory, setSubCategory] = useState("");
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /**
     * טעינת קטגוריות בטעינת הקומפוננטה
     */
    useEffect(() => {
        const loadCategories = async (): Promise<void> => {
            try {
                setLoading(true);
                const data = await fetchCategories();
                setCategories(data);
            } catch (err) {
                console.error("Error loading categories:", err);
                setError("שגיאה בטעינת קטגוריות");
            } finally {
                setLoading(false);
            }
        };
        loadCategories();
    }, []);

    /**
     * טעינת תת-קטגוריות כאשר נבחרת קטגוריה
     */
    useEffect(() => {
        if (!category) {
            setSubCategories([]);
            return;
        }

        const loadSubCategories = async (): Promise<void> => {
            try {
                setLoading(true);
                const data = await fetchSubCategories(Number(category));
                setSubCategories(data);
            } catch (err) {
                console.error("Error loading subcategories:", err);
                setError("שגיאה בטעינת תתי קטגוריות");
            } finally {
                setLoading(false);
            }
        };
        loadSubCategories();
    }, [category]);

    /**
     * טיפול בשליחת הפרומפט ל-AI
     */
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError("");

        // ווידוא שכל השדות מולאו
        if (!category || !subCategory || !prompt.trim()) {
            setError("נא למלא קטגוריה, תת קטגוריה ושאלה לפני השליחה 🙏");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setResponse("");

            const result = await addPrompt({
                user_id: user?.id || 1,
                category_id: Number(category),
                sub_category_id: Number(subCategory),
                prompt,
            });

            setResponse(result.response ?? "");

            // הוספה להיסטוריה המקומית
            addToHistory({
                category,
                subCategory,
                prompt,
                response: result.response ?? ""
            });
        } catch (err) {
            console.error("Error sending prompt:", err);
            setError("שגיאה בשליחה ל־AI. אנא נסי שוב מאוחר יותר.");
        } finally {
            setLoading(false);
            setPrompt(""); // איפוס השאלה לאחר שליחה מוצלחת
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-72 h-72 bg-white opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
                <div className="absolute top-40 right-20 w-72 h-72 bg-pink-300 opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-40 w-72 h-72 bg-yellow-300 opacity-10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-right relative z-10 glass border border-white border-opacity-20">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-3xl">🤖</span>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        שאל את ה-AI
                    </h1>
                    <p className="text-gray-600">שאל כל שאלה ותקבל תשובה מותאמת אישית</p>
                </div>

                {loading && (
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full">
                            <div className="animate-spin w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full ml-2"></div>
                            <span className="text-indigo-700 font-medium">מעבד את הבקשה...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-slideDown">
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="group">
                            <label className="block text-gray-700 mb-2 font-medium">קטגוריה</label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-indigo-300 appearance-none bg-white"
                                >
                                    <option value="">בחרי קטגוריה</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute left-3 top-3 text-gray-400 pointer-events-none">
                                    <span>📚</span>
                                </div>
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-gray-700 mb-2 font-medium">תת קטגוריה</label>
                            <div className="relative">
                                <select
                                    value={subCategory}
                                    onChange={(e) => setSubCategory(e.target.value)}
                                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-indigo-300 appearance-none bg-white disabled:bg-gray-50"
                                    disabled={!category}
                                >
                                    <option value="">בחרי תת קטגוריה</option>
                                    {subCategories.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute left-3 top-3 text-gray-400 pointer-events-none">
                                    <span>🏷️</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-gray-700 mb-2 font-medium">השאלה שלך</label>
                        <div className="relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 group-hover:border-indigo-300 resize-none"
                                placeholder="הקלידי כאן את השאלה שלך..."
                                rows={4}
                            ></textarea>
                            <div className="absolute left-4 bottom-4 text-gray-400 pointer-events-none">
                                <span>✍️</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !category || !subCategory || !prompt.trim()}
                        className={`w-full py-4 rounded-xl text-white font-semibold transition-all duration-300 transform ${
                            loading || !category || !subCategory || !prompt.trim()
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl hover:scale-105"
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full ml-2"></div>
                                שולח ל-AI...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center">
                                <span className="ml-2">🚀</span>
                                שלחי ל־AI
                            </span>
                        )}
                    </button>
                </form>

                {response && (
                    <div className="mt-8 animate-fadeIn">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center ml-3">
                                    <span className="text-white text-sm">🤖</span>
                                </div>
                                <h2 className="font-bold text-indigo-700 text-lg">תשובת AI</h2>
                            </div>
                            <div className="bg-white rounded-lg p-4 shadow-inner">
                                <p className="text-gray-800 whitespace-pre-line leading-relaxed">{response}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromptPage;
