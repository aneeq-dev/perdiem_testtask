import { Request, Response } from 'express';
import { squareService } from '../services/square.service';

const toMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unexpected server error';

export const squareController = {
  async getLocations(req: Request, res: Response): Promise<void> {
    try {
      const data = await squareService.listActiveLocations();
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(502).json({
        success: false,
        error: 'Square API Error',
        message: toMessage(error),
      });
    }
  },

  async getCatalog(req: Request, res: Response): Promise<void> {
    try {
      const locationId = String(req.query.location_id || '');
      if (!locationId) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'location_id query parameter is required',
        });
        return;
      }
      const data = await squareService.listCatalogByCategory(locationId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(502).json({
        success: false,
        error: 'Square API Error',
        message: toMessage(error),
      });
    }
  },

  async getCatalogCategories(req: Request, res: Response): Promise<void> {
    try {
      const locationId = String(req.query.location_id || '');
      if (!locationId) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'location_id query parameter is required',
        });
        return;
      }
      const data = await squareService.listCatalogCategories(locationId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(502).json({
        success: false,
        error: 'Square API Error',
        message: toMessage(error),
      });
    }
  },

  async handleCatalogWebhook(req: Request, res: Response): Promise<void> {
    const body = JSON.stringify(req.body || {});
    const signature = String(req.headers['x-square-hmacsha256-signature'] || '');
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

    if (!squareService.verifyWebhookSignature(body, signature, url)) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid Square webhook signature',
      });
      return;
    }

    const eventType = req.body?.type;
    if (eventType === 'catalog.version.updated') {
      squareService.clearMenuCaches();
    }

    res.status(200).json({ success: true, data: { received: true, eventType } });
  },
};

