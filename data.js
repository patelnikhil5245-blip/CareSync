// ─── Mock Database (simulates MySQL tables) ───

const DB = {
  patients: [],        // Patient table
  appointments: [],    // Appointment table
  nextPatientId: 1,
  nextApptId: 1,
};

// ─── Doctor Table (seed data) ───
const DOCTORS = [
  { doctor_id: 1, name: "Dr. Atul Singh",   specialization: "Cardiologist",      experience: 12, available_time: "9:00 AM, 11:00 AM, 2:00 PM, 4:30 PM", emoji: "👩‍⚕️" },
  { doctor_id: 2, name: "Dr. Kajal Maheshwari",    specialization: "Neurologist",       experience: 9,  available_time: "10:00 AM, 1:00 PM, 3:00 PM, 5:00 PM", emoji: "👨‍⚕️" },
  { doctor_id: 3, name: "Dr. Ayesha Malik",  specialization: "Dermatologist",     experience: 7,  available_time: "8:30 AM, 11:30 AM, 2:30 PM, 4:00 PM", emoji: "👩‍⚕️" },
  { doctor_id: 4, name: "Dr. Rjesh Mishra",  specialization: "Orthopedic",        experience: 15, available_time: "9:00 AM, 12:00 PM, 3:30 PM, 5:30 PM", emoji: "👨‍⚕️" },
  { doctor_id: 5, name: "Dr. Malik Sinha", specialization: "Pediatrician",      experience: 10, available_time: "8:00 AM, 10:30 AM, 1:30 PM, 4:00 PM", emoji: "👩‍⚕️" },
  { doctor_id: 6, name: "Dr. Navjot Rana",  specialization: "General Physician", experience: 5,  available_time: "9:00 AM, 11:00 AM, 2:00 PM, 5:00 PM", emoji: "👨‍⚕️" },
  { doctor_id: 7, name: "Dr. Zara Qureshi", specialization: "Dermatologist",     experience: 8,  available_time: "10:00 AM, 12:30 PM, 3:00 PM, 4:30 PM", emoji: "👩‍⚕️" },
  { doctor_id: 8, name: "Dr. Imran Butt",   specialization: "Cardiologist",      experience: 18, available_time: "9:30 AM, 11:30 AM, 2:30 PM, 4:00 PM", emoji: "👨‍⚕️" },
];
