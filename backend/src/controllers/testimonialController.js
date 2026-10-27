import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import * as testimonialModel from '../models/testimonialModel.js';

/** GET /api/testimonials (public) */
export const listTestimonials = asyncHandler(async (req, res) => {
  const featuredOnly = req.user?.role === 'admin' ? false : true;
  const testimonials = await testimonialModel.listTestimonials({ featuredOnly });
  res.json({ testimonials });
});

/** POST /api/testimonials (admin) */
export const createTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await testimonialModel.createTestimonial(req.body);
  res.status(201).json({ testimonial });
});

/** DELETE /api/testimonials/:id (admin) */
export const deleteTestimonial = asyncHandler(async (req, res) => {
  const ok = await testimonialModel.deleteTestimonial(req.params.id);
  if (!ok) throw ApiError.notFound('Testimonial not found');
  res.status(204).send();
});
