import { Router } from 'express';

const router = Router();

// 健康检查接口
router.get('/', (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    service: "Linkol HTML模板图片生成器 API"
  });
});

export default router;
