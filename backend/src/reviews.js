const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const router = express.Router();
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});
const prisma = new PrismaClient({ adapter });

router.post('/add', async (req, res) => {
  try {
    const { appointment_id, customer_id, shop_id, rating, comment } = req.body;

    const existing = await prisma.review.findUnique({
      where: { appointment_id: parseInt(appointment_id) }
    });
    if (existing) return res.status(400).json({ error: 'Review already exists' });

    const newReview = await prisma.review.create({
      data: {
        appointment_id: parseInt(appointment_id),
        customer_id: parseInt(customer_id),
        shop_id: parseInt(shop_id),
        rating: parseInt(rating),
        comment: comment
      }
    });

    res.status(201).json({ message: 'Review submitted!', review: newReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

module.exports = router;