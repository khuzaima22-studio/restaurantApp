import express from 'express';
import Menu from '../../Models/Menu.js';
const router = express.Router();

router.delete('/:menuId/item/:itemId', async (req, res) => {
  try {
    const { menuId, itemId } = req.params;

    const result = await Menu.findByIdAndUpdate(
      menuId,
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Menu or item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully'});
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router