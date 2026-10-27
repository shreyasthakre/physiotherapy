import asyncHandler from '../utils/asyncHandler.js';
import * as notificationModel from '../models/notificationModel.js';

/** GET /api/notifications — recent notification log (admin only). */
export const listRecentNotifications = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 25, 100);
  const notifications = await notificationModel.listRecent(limit);
  res.json({ notifications });
});
