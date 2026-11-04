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
    const { owner_id, service_name, price, duration_minutes, category } = req.body;

    const shop = await prisma.barbershop.findUnique({
      where: { owner_id: parseInt(owner_id) }
    });

    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const newService = await prisma.service.create({
      data: {
        shop_id: shop.shop_id,
        service_name: service_name,
        price: parseFloat(price),
        duration_minutes: parseInt(duration_minutes),
        category: category
      }
    });

    res.status(201).json({ message: 'Service added!', service: newService });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add service' });
  }
});
// Kunin lahat ng services mula sa ACTIVE barbershops
router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        is_active: true,
        shop: { status: 'ACTIVE' } // Puro active shops lang
      },
      include: {
        shop: { 
          select: { shop_name: true, shop_id: true, city: true } 
        }
      }
    });
    res.status(200).json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

module.exports = router;