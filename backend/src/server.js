const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

dotenv.config();
const app = express();

// Setup Prisma with Driver Adapter
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('SnipBook Backend API is running! 🚀');
});

const authRoutes = require('./auth');
app.use('/api/auth', authRoutes);
const subscriptionRoutes = require('./subscription');
app.use('/api/subscription', subscriptionRoutes);
const galleryRoutes = require('./gallery');
app.use('/api/gallery', galleryRoutes);
const shopRoutes = require('./shop');
app.use('/api/shops', shopRoutes);
const serviceRoutes = require('./service');
app.use('/api/services', serviceRoutes);
const bookingRoutes = require('./booking');
app.use('/api/bookings', bookingRoutes);
const reviewRoutes = require('./reviews');
app.use('/api/reviews', reviewRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});