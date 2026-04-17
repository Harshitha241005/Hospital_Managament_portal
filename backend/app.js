const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const prescriptionRoutes = require('./routes/prescriptionRoutes');
const billRoutes = require('./routes/billRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/reports', reportRoutes);

app.listen(process.env.PORT || 5000);