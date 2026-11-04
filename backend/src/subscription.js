const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const router = express.Router();
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});
const prisma = new PrismaClient({ adapter });

router.post('/subscribe', async (req, res) => {
  try {
    const { owner_id, plan, amount } = req.body;

    let shop = await prisma.barbershop.findUnique({
      where: { owner_id: parseInt(owner_id) }
    });

    if (!shop) {
      shop = await prisma.barbershop.create({
        data: {
          owner_id: parseInt(owner_id),
          shop_name: "My Barbershop",
          address: "Default Address",
          city: "Default City",
          status: 'PENDING'
        }
      });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(startDate.getFullYear() + 1);

    const subscription = await prisma.subscription.create({
      data: {
        shop_id: shop.shop_id,
        plan: plan === 'PREMIUM' ? 'PREMIUM' : 'BASIC',
        start_date: startDate,
        end_date: endDate,
        amount: amount,
        payment_method: 'GCash',
        status: 'ACTIVE'
      }
    });

    await prisma.barbershop.update({
      where: { shop_id: shop.shop_id },
      data: { status: 'ACTIVE' }
    });

    res.status(200).json({
      message: 'Subscription successful! 🎉',
      subscription: subscription
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process subscription' });
  }
});
router.get('/status/:owner_id', async (req, res) => {
  try {
    const shop = await prisma.barbershop.findUnique({ 
      where: { owner_id: parseInt(req.params.owner_id) } 
    });
    
    if (!shop) return res.status(404).json({ status: 'inactive' });
    
    const sub = await prisma.subscription.findFirst({
      where: { shop_id: shop.shop_id, status: 'ACTIVE' },
      orderBy: { end_date: 'desc' }
    });
    
    if (sub && new Date(sub.end_date) > new Date()) {
      res.status(200).json({ status: 'active' });
    } else {
      res.status(200).json({ status: 'inactive' });
    }
  } catch (error) {
    res.status(500).json({ status: 'inactive' });
  }
});

module.exports = router;