const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const router = express.Router();
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});
const prisma = new PrismaClient({ adapter });

// Kunin lahat ng ACTIVE na barbershops para sa public directory
router.get('/', async (req, res) => {
  try {
    const shops = await prisma.barbershop.findMany({
      where: { status: 'ACTIVE' },
      include: {
        gallery: true, // Isama ang mga litrato nila
        services: true // Isama ang mga services nila
      }
    });
    res.status(200).json(shops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});
// Kunin ang specific na shop gamit ang ID
router.get('/:id', async (req, res) => {
  try {
    const shop = await prisma.barbershop.findUnique({
      where: { shop_id: parseInt(req.params.id) },
      include: {
        gallery: true,
        services: true,
        barbers: true
      }
    });

    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    
    res.status(200).json(shop);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shop details' });
  }
});
module.exports = router;