# 🏥 MediCare HMS — Hospital Management System

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
The `.env` file is pre-configured for local MongoDB:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hms_db
JWT_SECRET=hms_super_secret_jwt_key_2025
```

### 3. Seed Database (First Time)
```bash
cd backend
node config/seed.js
```

### 4. Start Server
```bash
node server.js
# or for development:
npx nodemon server.js
```

### 5. Open in Browser
Visit: http://localhost:5000

---

## Demo Login Credentials

| Role    | Email                    | Password  |
|---------|--------------------------|-----------|
| Admin   | admin@hospital.com       | admin123  |
| Doctor  | priya@hospital.com       | doc123    |
| Patient | ravi@email.com           | pat123    |

---

## Features Fixed & Added

### Auth
- ✅ JWT login/register fully working
- ✅ Role-based redirects (admin/doctor/patient)
- ✅ Password reset
- ✅ Token refresh on page load

### Admin Dashboard
- ✅ Real stats (patients, doctors, appointments, revenue)
- ✅ All appointments table with status filters
- ✅ Add/delete doctors
- ✅ View all patients
- ✅ View all prescriptions
- ✅ Generate bill from prescription with custom fees
- ✅ Real-time total calculation
- ✅ View bills & mark as paid
- ✅ Download professional PDF invoice (real PDF via html2pdf)
- ✅ Medicines CRUD
- ✅ Reports viewer
- ✅ Settings panel

### Doctor Dashboard
- ✅ Today's appointments + upcoming overview
- ✅ Accept / Decline / Complete appointments
- ✅ Write prescription modal (medicines + diagnosis + notes)
- ✅ View all patients
- ✅ Prescriptions list per patient
- ✅ Reports viewer
- ✅ Profile view & edit (availability, slots, personal info)

### Patient Dashboard
- ✅ Dashboard overview with stats
- ✅ Book appointment: Choose Speciality → Select Doctor → Pick Date & Slot → Confirm
- ✅ Cancel appointments
- ✅ View prescriptions (detailed with medicine schedule)
- ✅ View lab reports
- ✅ Billing: View all bills, real invoice view, download real PDF
- ✅ Profile edit (name, phone, age, gender, blood group, address)

### API Routes (all fixed)
- POST /api/auth/login
- POST /api/auth/register  
- GET/PUT /api/auth/me
- POST /api/auth/reset-password
- GET/POST /api/appointments
- PATCH /api/appointments/:id/status
- GET/POST /api/prescriptions
- GET/POST /api/bills/from-prescription/:id
- GET/PATCH /api/bills/:id
- GET /api/patient/appointments|prescriptions|bills
- GET /api/users/doctors?speciality=&available=
- GET /api/users/patients
- GET /api/admin/stats
- POST /api/admin/doctors
- GET/POST/DELETE /api/medicines
- GET /api/reports
