import { Router } from 'express';
import { squareController } from '../controllers/square.controller';

const router = Router();

router.get('/locations', squareController.getLocations);
router.get('/catalog', squareController.getCatalog);
router.get('/catalog/categories', squareController.getCatalogCategories);
router.post('/webhooks/square', squareController.handleCatalogWebhook);

export default router;

