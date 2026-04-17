require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User        = require('../models/User');
const Appointment = require('../models/Appointment');
const Bill        = require('../models/Bill');
const Prescription= require('../models/Prescription');
const { Medicine, Disease } = require('../models/Others');
const Report = require('../models/Report');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hms_db';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  await Promise.all([
    User.deleteMany({}), Appointment.deleteMany({}),
    Bill.deleteMany({}), Prescription.deleteMany({}),
    Report.deleteMany({}), Medicine.deleteMany({}), Disease.deleteMany({})
  ]);
  console.log('🗑  Cleared existing data');

  const hash = async (p) => bcrypt.hash(p, 10);

  const users = await User.insertMany([
    { name:'Admin User',       email:'admin@hospital.com',   password: await hash('admin123'), role:'admin',   phone:'9876543210' },
    { name:'Dr. Priya Sharma', email:'priya@hospital.com',   password: await hash('doc123'),   role:'doctor',  phone:'9876543211', speciality:'Cardiology',    experience:12, hospital:'MediCare Hospital', rating:4.8, available:true,  slots:['9:00 AM','10:00 AM','2:00 PM','4:00 PM'] },
    { name:'Dr. Rahul Mehta',  email:'rahul@hospital.com',   password: await hash('doc123'),   role:'doctor',  phone:'9876543212', speciality:'Neurology',     experience:8,  hospital:'MediCare Hospital', rating:4.6, available:true,  slots:['10:00 AM','11:00 AM','3:00 PM'] },
    { name:'Dr. Anita Verma',  email:'anita@hospital.com',   password: await hash('doc123'),   role:'doctor',  phone:'9876543213', speciality:'Orthopedics',   experience:15, hospital:'MediCare Hospital', rating:4.9, available:true,  slots:['9:30 AM','1:00 PM','3:30 PM'] },
    { name:'Dr. Suresh Babu',  email:'suresh@hospital.com',  password: await hash('doc123'),   role:'doctor',  phone:'9876543214', speciality:'Dermatology',   experience:6,  hospital:'MediCare Hospital', rating:4.5, available:true,  slots:['11:00 AM','12:00 PM','5:00 PM'] },
    { name:'Dr. Kavitha Nair', email:'kavitha@hospital.com', password: await hash('doc123'),   role:'doctor',  phone:'9876543215', speciality:'Gynecology',    experience:10, hospital:'MediCare Hospital', rating:4.7, available:true,  slots:['9:00 AM','11:00 AM','3:00 PM','4:30 PM'] },
    { name:'Dr. Arvind Kumar', email:'arvind@hospital.com',  password: await hash('doc123'),   role:'doctor',  phone:'9876543216', speciality:'Pediatrics',    experience:9,  hospital:'MediCare Hospital', rating:4.8, available:true,  slots:['10:30 AM','2:30 PM','5:00 PM'] },
    { name:'Dr. Meena Rao',    email:'meena.doc@hospital.com',password: await hash('doc123'), role:'doctor',  phone:'9876543219', speciality:'General Medicine',experience:5, hospital:'MediCare Hospital', rating:4.4, available:true,  slots:['9:00 AM','10:00 AM','11:00 AM','2:00 PM'] },
    { name:'Ravi Patient',     email:'ravi@email.com',       password: await hash('pat123'),   role:'patient', phone:'9876543217', age:34, bloodGroup:'O+', gender:'Male', address:'Chennai, Tamil Nadu' },
    { name:'Meena Patient',    email:'meena@email.com',      password: await hash('pat123'),   role:'patient', phone:'9876543218', age:28, bloodGroup:'A+', gender:'Female', address:'Mumbai, Maharashtra' }
  ]);
  console.log(`👥 Created ${users.length} users`);

  const [admin, drPriya, drRahul, drAnita, drSuresh, drKavitha, drArvind, drMeena, ravi, meena] = users;

  const today = new Date().toISOString().split('T')[0];
  const tom = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const appointments = await Appointment.insertMany([
    { patient:ravi._id,  doctor:drPriya._id,   speciality:'Cardiology',    date:today, time:'10:00 AM', status:'confirmed',  condition:'Chest pain and shortness of breath', notes:'Patient complains of chest discomfort after physical activity.' },
    { patient:ravi._id,  doctor:drRahul._id,   speciality:'Neurology',     date:tom,   time:'11:00 AM', status:'pending',    condition:'Frequent headaches' },
    { patient:meena._id, doctor:drKavitha._id, speciality:'Gynecology',    date:today, time:'9:00 AM',  status:'completed',  condition:'Routine checkup', notes:'Prescribed vitamins and iron supplements.' },
    { patient:meena._id, doctor:drArvind._id,  speciality:'Pediatrics',    date:tom,   time:'2:30 PM',  status:'pending',    condition:'Child vaccination' },
    { patient:ravi._id,  doctor:drAnita._id,   speciality:'Orthopedics',   date:'2025-05-20', time:'1:00 PM', status:'cancelled',  condition:'Knee pain' }
  ]);
  console.log(`📅 Created ${appointments.length} appointments`);

  const [apt1, apt2, apt3] = appointments;

  const prescriptions = await Prescription.insertMany([
    {
      patient: ravi._id, doctor: drPriya._id, appointment: apt1._id,
      diagnosis: 'Hypertension with mild cardiac strain',
      medicines: [
        { name:'Amlodipine', dosage:'5mg', frequency:'Once daily', duration:'30 days', quantity:30, unitPrice:15 },
        { name:'Atenolol',   dosage:'50mg', frequency:'Once daily', duration:'30 days', quantity:30, unitPrice:10 }
      ],
      notes: 'Avoid salt. Regular BP monitoring. Follow-up in 4 weeks.'
    },
    {
      patient: meena._id, doctor: drKavitha._id, appointment: apt3._id,
      diagnosis: 'Mild iron-deficiency anemia',
      medicines: [
        { name:'Vitamin D3', dosage:'60000 IU', frequency:'Weekly', duration:'8 weeks', quantity:8, unitPrice:4 },
        { name:'Ferrous Sulfate', dosage:'200mg', frequency:'Twice daily', duration:'30 days', quantity:60, unitPrice:5 }
      ],
      notes: 'Increase iron-rich food intake. Retest hemoglobin in 6 weeks.'
    }
  ]);
  console.log('💊 Created prescriptions');

  const [presc1, presc2] = prescriptions;

  function calcBill(items, cFee, lFee, other, taxRate, disc) {
    const iTotal = items.reduce((s,i) => s + i.quantity * i.unitPrice, 0);
    const sub = iTotal + cFee + lFee + other;
    const tax = sub * (taxRate / 100);
    return { sub, tax, grand: sub + tax - disc };
  }

  const b1items = presc1.medicines.map(m => ({ name:m.name, dosage:m.dosage, quantity:m.quantity, unitPrice:m.unitPrice, amount:m.quantity*m.unitPrice }));
  const b1 = calcBill(b1items, 800, 1200, 0, 5, 0);
  const b2items = presc2.medicines.map(m => ({ name:m.name, dosage:m.dosage, quantity:m.quantity, unitPrice:m.unitPrice, amount:m.quantity*m.unitPrice }));
  const b2 = calcBill(b2items, 600, 900, 0, 5, 50);

  await Bill.insertMany([
    {
      billNo: `BILL-${Date.now()}`, patient: ravi._id, doctor: drPriya._id,
      appointment: apt1._id, prescription: presc1._id,
      items: b1items, consultationFee:800, labFee:1200, otherCharges:0,
      subtotal: b1.sub, taxRate:5, taxAmount: b1.tax, discount:0, grandTotal: b1.grand,
      status: 'paid'
    },
    {
      billNo: `BILL-${Date.now()+1}`, patient: meena._id, doctor: drKavitha._id,
      appointment: apt3._id, prescription: presc2._id,
      items: b2items, consultationFee:600, labFee:900, otherCharges:0,
      subtotal: b2.sub, taxRate:5, taxAmount: b2.tax, discount:50, grandTotal: b2.grand,
      status: 'unpaid'
    }
  ]);
  console.log('💰 Created bills');

  await Report.insertMany([
    { patient:ravi._id,  doctor:drPriya._id,   uploadedBy:drPriya._id,   appointment:apt1._id, type:'ECG',        result:'Normal sinus rhythm. Mild left ventricular hypertrophy.', title:'ECG Report' },
    { patient:meena._id, doctor:drKavitha._id, uploadedBy:drKavitha._id, appointment:apt3._id, type:'Blood Test', result:'Hemoglobin: 10.2 g/dL — mild anemia. Iron: 45 mcg/dL (low)', title:'Blood Panel' },
    { patient:ravi._id,  doctor:drAnita._id,   uploadedBy:drAnita._id,                         type:'X-Ray',      result:'No fracture detected; mild joint wear at patella', title:'Knee X-Ray' }
  ]);
  console.log('🧪 Created reports');

  await Medicine.insertMany([
    { name:'Amoxicillin',        category:'Antibiotic',              stock:240, price:12,  unit:'tablet' },
    { name:'Paracetamol',        category:'Analgesic',               stock:580, price:3,   unit:'tablet' },
    { name:'Omeprazole',         category:'Antacid',                 stock:180, price:8,   unit:'capsule' },
    { name:'Metformin',          category:'Antidiabetic',            stock:320, price:6,   unit:'tablet' },
    { name:'Atenolol',           category:'Beta-blocker',            stock:140, price:10,  unit:'tablet' },
    { name:'Amlodipine',         category:'Calcium Channel Blocker', stock:95,  price:15,  unit:'tablet' },
    { name:'Cetirizine',         category:'Antihistamine',           stock:420, price:5,   unit:'tablet' },
    { name:'Ibuprofen',          category:'NSAID',                   stock:360, price:7,   unit:'tablet' },
    { name:'Insulin Glargine',   category:'Insulin',                 stock:45,  price:180, unit:'vial' },
    { name:'Salbutamol Inhaler', category:'Bronchodilator',          stock:60,  price:220, unit:'inhaler' },
    { name:'Losartan',           category:'ARB',                     stock:210, price:12,  unit:'tablet' },
    { name:'Vitamin D3',         category:'Supplement',              stock:480, price:4,   unit:'capsule' }
  ]);
  console.log('🏪 Created medicines');

  await Disease.insertMany([
    { name:'Hypertension',            specialist:'Cardiology',       symptoms:'High BP, headache, dizziness',              medicines:['Amlodipine','Losartan','Atenolol'] },
    { name:'Diabetes Type 2',         specialist:'Endocrinology',    symptoms:'Frequent urination, fatigue, blurred vision',medicines:['Metformin','Insulin Glargine'] },
    { name:'Asthma',                  specialist:'Pulmonology',      symptoms:'Wheezing, breathlessness, chest tightness',  medicines:['Salbutamol Inhaler'] },
    { name:'Migraine',                specialist:'Neurology',        symptoms:'Severe headache, nausea, light sensitivity', medicines:['Ibuprofen','Paracetamol'] },
    { name:'Gastritis',               specialist:'Gastroenterology', symptoms:'Stomach pain, bloating, nausea',             medicines:['Omeprazole'] },
    { name:'Allergic Rhinitis',       specialist:'Dermatology',      symptoms:'Sneezing, runny nose, itching',              medicines:['Cetirizine'] },
    { name:'Urinary Tract Infection', specialist:'Urology',          symptoms:'Burning urination, frequency, fever',        medicines:['Amoxicillin'] },
    { name:'Osteoarthritis',          specialist:'Orthopedics',      symptoms:'Joint pain, stiffness, swelling',            medicines:['Ibuprofen','Paracetamol'] },
    { name:'Anemia',                  specialist:'Hematology',       symptoms:'Fatigue, weakness, pale skin',               medicines:['Vitamin D3'] },
    { name:'Viral Fever',             specialist:'General Medicine', symptoms:'Fever, body ache, fatigue',                  medicines:['Paracetamol','Ibuprofen'] }
  ]);
  console.log('🦠 Created diseases');

  console.log('\n✅ Seed complete!\n');
  console.log('─────────────────────────────────────────────────');
  console.log('  Demo Login Credentials');
  console.log('─────────────────────────────────────────────────');
  console.log('  Admin:   admin@hospital.com  / admin123');
  console.log('  Doctor:  priya@hospital.com  / doc123');
  console.log('  Patient: ravi@email.com      / pat123');
  console.log('─────────────────────────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });
