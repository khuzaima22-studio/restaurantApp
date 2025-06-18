import express from 'express';
import Purchase from '../../Models/Purchase.js';


const router = express.Router();

router.post("/", async (req, res) => {
  const { userId, total, branchId, cart } = req.body;

  try {
    if (!total || !userId || !branchId || !cart || !Array.isArray(cart)) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const orderItems = cart.map(({ item, qty }) => ({
      name: item.name,
      qty
    }));

    const newPurchase = new Purchase({
      user: userId,
      branch: branchId,
      Order: orderItems,
      paid: total
    });

    await newPurchase.save();

    res.status(200).json({ message: "Purchased Successfully" });
  } catch (err) {
    console.error('Error saving purchasing:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
