import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CookiesProvider } from "react-cookie"; // Importa CookiesProvider
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DrinkMenu from "./pages/DrinkMenu";

function App() {
  return (
    <CookiesProvider> {/* Envuelve toda la app */}
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/Dashboard" 
            element={
              //<ProtectedRoute>
                <Dashboard />
              //</ProtectedRoute>
            } 
          />
          <Route 
            path="/Drinks" 
            element={
              //<ProtectedRoute>
                <DrinkMenu />
              //</ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </CookiesProvider>
  );
}

export default App;
