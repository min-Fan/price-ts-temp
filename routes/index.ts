import { Router } from 'express';
import healthRoutes from './health';
import chartRoutes from './chart';
import cardRoutes from './card';
import batchRoutes from './batch';
import filesRoutes from './files';

const router = Router();

// 注册路由
router.use('/health', healthRoutes);
router.use('/chart', chartRoutes);
router.use('/card', cardRoutes);
router.use('/batch', batchRoutes);
router.use('/files', filesRoutes);

export default router;
