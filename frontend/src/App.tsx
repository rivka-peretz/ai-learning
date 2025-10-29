import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import { UserProvider, useUser } from "./context/UserContext";
import PromptPage from "./pages/PromptPage";
import HistoryPage from "./pages/HistoryPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import Navbar from "./components/Navbar";

const AppRoutes = () => {
  const { user } = useUser();

  return (
    <>
      <Navbar />
      <div className="pt-20">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate
                  to={user.role === "admin" ? "/AdminDashboard" : "/dashboard"}
                  replace
                />
              ) : (
                <Navigate to="/register" replace />
              )
            }
          />

          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
          />

          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
          />

          <Route
            path="/dashboard"
            element={user ? <DashboardPage /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/prompt"
            element={user ? <PromptPage /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/history"
            element={user ? <HistoryPage /> : <Navigate to="/login" replace />}
          />

          <Route
            path="/AdminDashboard"
            element={
              user && user.role === "admin" ? (
                <AdminDashboardPage />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
}

export default App;
