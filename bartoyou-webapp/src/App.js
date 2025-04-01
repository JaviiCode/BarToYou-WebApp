import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import DrinkMenu from "./pages/DrinkMenu";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
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
