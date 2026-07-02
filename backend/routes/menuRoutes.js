import express from 'express';
import {
  createMenu,
  deleteMenu,
  getMenuById,
  getMenus,
  updateMenu,
} from '../controllers/menuController.js';
import { verifyAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getMenus);
router.get('/:id', getMenuById);
router.post('/', verifyAdmin, createMenu);
router.put('/:id', verifyAdmin, updateMenu);
router.delete('/:id', verifyAdmin, deleteMenu);

export default router;
