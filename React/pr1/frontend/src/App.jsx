import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Authcontext";
import { CartProvider } from "./Cartcontext";
import Navbar from "./Navbar";
import Catalog from "./Catalog";
import Cart from "./Cart";
import Dashboard from "./Dashboard";
import Login from "./Login";
import ServiceDetail from "./ServiceDetail";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Navbar />
          <div style={{ paddingBottom: "40px" }}>
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/service/:id" element={<ServiceDetail />} />
            </Routes>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;