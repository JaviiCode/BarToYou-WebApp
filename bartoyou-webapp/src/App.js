import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DrinkMenu from "./pages/DrinkMenu";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/drinks" element={<DrinkMenu />} />
      </Routes>
    </Router>
  );
}

export default App;
