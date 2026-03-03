import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar, BottomNav, ToastContainer } from './components/UI';
import Home           from './pages/Home';
import { Register, Login, DoctorLogin, AdminLogin } from './pages/Auth';
import Doctors        from './pages/Doctors';
import BookAppointment from './pages/BookAppointment';
import Appointments   from './pages/Appointments';
import Profile        from './pages/Profile';
import DoctorPanel    from './pages/DoctorPanel';
import Admin          from './pages/Admin';
import Payment        from './pages/Payment';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell" style={{ flexDirection:'column' }}>
          <Navbar />
          <ToastContainer />
          <div style={{ flex:1 }}>
            <Routes>
              <Route path="/"             element={<Home />} />
              <Route path="/register"     element={<Register />} />
              <Route path="/login"        element={<Login />} />
              <Route path="/doctor-login" element={<DoctorLogin />} />
              <Route path="/admin-login"  element={<AdminLogin />} />
              <Route path="/doctors"      element={<Doctors />} />
              <Route path="/book/:id"     element={<BookAppointment />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/profile"      element={<Profile />} />
              <Route path="/doctor-panel" element={<DoctorPanel />} />
              <Route path="/admin"        element={<Admin />} />
              <Route path="/payment"      element={<Payment />} />
            </Routes>
          </div>
          <BottomNav />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
