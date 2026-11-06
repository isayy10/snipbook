const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const crypto = require('crypto'); // Para sa QR code generation

const router = express.Router();
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});
const prisma = new PrismaClient({ adapter });

router.post('/create', async (req, res) => {
  try {
    const { customer_id, shop_id, service_id, appointment_date, appointment_time, total_amount } = req.body;

    // Generate a random string for the QR code pass
    const qr_code = crypto.randomBytes(16).toString('hex');

    const newBooking = await prisma.appointment.create({
      data: {
        customer_id: parseInt(customer_id),
        shop_id: parseInt(shop_id),
        service_id: parseInt(service_id),
        appointment_date: new Date(appointment_date),
        appointment_time: appointment_time,
        total_amount: parseFloat(total_amount),
        status: 'PENDING',
        qr_code: qr_code
      }
    });

    res.status(201).json({ message: 'Booking successful!', appointment: newBooking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});
// Kunin lahat ng appointments para sa isang shop owner
router.get('/owner/:owner_id', async (req, res) => {
  try {
    const shop = await prisma.barbershop.findUnique({
      where: { owner_id: parseInt(req.params.owner_id) }
    });

    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const appointments = await prisma.appointment.findMany({
      where: { shop_id: shop.shop_id },
      include: {
        service: true,
        customer: { select: { full_name: true, phone: true } }
      },
      orderBy: { appointment_date: 'asc' }
    });

    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});
// I-update ang status ng booking (Confirm/Cancel)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await prisma.appointment.update({
      where: { appointment_id: parseInt(req.params.id) },
      data: { status: status }
    });
    res.status(200).json({ message: 'Status updated!', appointment: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});
// Kunin ang mga bookings ng isang customer
router.get('/customer/:customer_id', async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { customer_id: parseInt(req.params.customer_id) },
      include: {
        shop: { select: { shop_name: true, address: true, owner_id: true } },
        service: true
        
      },
      orderBy: { appointment_date: 'desc' }
    });
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

module.exports = router;