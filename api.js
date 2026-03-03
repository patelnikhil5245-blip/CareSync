import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// ── Auth ──────────────────────────────────────
export const registerPatient  = (data)         => API.post('/auth/register', data);
export const loginPatient     = (data)         => API.post('/auth/login', data);
export const loginDoctor      = (data)         => API.post('/auth/doctor-login', data);
export const loginAdmin       = (data)         => API.post('/auth/admin-login', data);

// ── Doctors ───────────────────────────────────
export const getDoctors       = (params)       => API.get('/doctors', { params });
export const getDoctorById    = (id)           => API.get(`/doctors/${id}`);
export const addReview        = (id, data)     => API.post(`/doctors/${id}/review`, data);

// ── Appointments ──────────────────────────────
export const bookAppointment  = (data)         => API.post('/appointments', data);
export const getMyAppointments= ()             => API.get('/appointments');
export const cancelAppointment= (id)           => API.patch(`/appointments/${id}/cancel`);

// ── Doctor Panel ──────────────────────────────
export const getDoctorAppts   = ()             => API.get('/doctor/appointments');
export const updateDoctorAppt = (id, status)   => API.patch(`/doctor/appointments/${id}`, { status });

// ── Patient Profile ───────────────────────────
export const getProfile       = ()             => API.get('/profile');
export const updateProfile    = (data)         => API.put('/profile', data);

// ── Admin ─────────────────────────────────────
export const getAdminStats    = ()             => API.get('/admin/stats');
export const getAdminAppts    = ()             => API.get('/admin/appointments');
export const getAdminPatients = ()             => API.get('/admin/patients');
export const getAdminDoctors  = ()             => API.get('/admin/doctors');
export const adminUpdateAppt  = (id, status)   => API.patch(`/admin/appointments/${id}`, { status });
export const adminDeleteDoctor= (id)           => API.delete(`/admin/doctors/${id}`);

export default API;

// ── Payments ──────────────────────────────────
export const getDoctorFee     = (doctor_id)            => API.get(`/payments/fee/${doctor_id}`);
export const simulatePayment  = (data)                 => API.post('/payments/simulate', data);
export const getPaymentByAppt = (appointment_id)       => API.get(`/payments/${appointment_id}`);
export const getAdminPayments = ()                     => API.get('/admin/payments');
