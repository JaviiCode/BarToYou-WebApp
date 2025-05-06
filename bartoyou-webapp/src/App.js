import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CookiesProvider } from "react-cookie"; // Importa CookiesProvider
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DrinkMenu from "./pages/DrinkMenu";
import Carry from "./pages/Carry";
import CustomDrink from "./pages/CustomDrink";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import ClientOrderDetails from "./pages/ClientOrderDetails";
import AddDrinkForm from "./pages/AddDrinkForm";

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
          <Route 
            path="/Carry" 
            element={
              //<ProtectedRoute>
                <Carry />
              //</ProtectedRoute>
            } 
          />
          <Route 
            path="/CustomDrink" 
            element={
              //<ProtectedRoute>
                <CustomDrink />
              //</ProtectedRoute>
            } 
          />
          <Route 
            path="/Orders" 
            element={
              //<ProtectedRoute>
                <Orders />
              //</ProtectedRoute>
            } 
          />
          <Route 
            path="/orders/:userId" 
            element={
              //<ProtectedRoute>
                <OrderDetails />
              //</ProtectedRoute>
            } 
          />
          <Route 
            path="/ClientOrderDetails" 
            element={
              //<ProtectedRoute>
                <ClientOrderDetails />
              //</ProtectedRoute>
            } 
          />
          <Route 
            path="/AddDrinkForm" 
            element={
              //<ProtectedRoute>
                <AddDrinkForm />
              //</ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </CookiesProvider>
  );
}

export default App;
