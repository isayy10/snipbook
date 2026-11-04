const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const router = express.Router();
const adapter = new PrismaPg({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});
const prisma = new PrismaClient({ adapter });

// 1. ROUTE PARA MAG-ADD NG PHOTO
router.post('/add', async (req, res) => {
  try {
    const { owner_id, image_url, style_name } = req.body;

    const shop = await prisma.barbershop.findUnique({
      where: { owner_id: parseInt(owner_id) }
    });

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found for this owner' });
    }

    const newPhoto = await prisma.haircutGallery.create({
      data: {
        shop_id: shop.shop_id,
        image_url: image_url,
        style_name: style_name,
        description: ''
      }
    });

    res.status(201).json({ message: 'Photo added!', photo: newPhoto });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add photo' });
  }
});

// 2. ROUTE PARA KUNIN ANG MGA PHOTOS
router.get('/my-photos/:owner_id', async (req, res) => {
  try {
    const shop = await prisma.barbershop.findUnique({
      where: { owner_id: parseInt(req.params.owner_id) }
    });

    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const photos = await prisma.haircutGallery.findMany({
      where: { shop_id: shop.shop_id },
      orderBy: { uploaded_at: 'desc' }
    });

    res.status(200).json(photos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});
// Route para i-delete ang isang photo
router.delete('/:id', async (req, res) => {
  try {
    await prisma.haircutGallery.delete({
      where: { gallery_id: parseInt(req.params.id) }
    });
    res.status(200).json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

module.exports = router;