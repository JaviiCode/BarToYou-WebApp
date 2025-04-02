import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DrinkMenu from "./pages/DrinkMenu";

function App() {
  return (
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
  );
}

export default App;
