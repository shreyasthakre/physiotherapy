import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import * as serviceModel from '../models/serviceModel.js';

/** GET /api/services */
export const listServices = asyncHandler(async (req, res) => {
  const includeInactive = req.user?.role === 'admin' && req.query.all === 'true';
  const services = await serviceModel.listServices({ includeInactive });
  res.json({ services });
});

/** GET /api/services/:slug */
export const getService = asyncHandler(async (req, res) => {
  const service = await serviceModel.getServiceBySlug(req.params.slug);
  if (!service) throw ApiError.notFound('Service not found');
  res.json({ service });
});

/** POST /api/services (admin) */
export const createService = asyncHandler(async (req, res) => {
  const service = await serviceModel.createService(req.body);
  res.status(201).json({ service });
});

/** PATCH /api/services/:id (admin) */
export const updateService = asyncHandler(async (req, res) => {
  const service = await serviceModel.updateService(req.params.id, req.body);
  if (!service) throw ApiError.notFound('Service not found');
  res.json({ service });
});

/** DELETE /api/services/:id (admin) */
export const deleteService = asyncHandler(async (req, res) => {
  const ok = await serviceModel.deleteService(req.params.id);
  if (!ok) throw ApiError.notFound('Service not found');
  res.status(204).send();
});
