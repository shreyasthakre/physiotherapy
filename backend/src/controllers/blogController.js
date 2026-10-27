import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import * as blogModel from '../models/blogModel.js';

/** GET /api/blog — published posts (public). */
export const listPosts = asyncHandler(async (req, res) => {
  const tag = req.query.tag || undefined;
  const posts = await blogModel.listPublished({ tag });
  res.json({ posts });
});

/** GET /api/blog/:slug */
export const getPost = asyncHandler(async (req, res) => {
  const post = await blogModel.getBySlug(req.params.slug);
  if (!post || !post.is_published) {
    // Staff can still preview unpublished posts.
    if (!post || !['admin', 'physiotherapist'].includes(req.user?.role)) {
      throw ApiError.notFound('Post not found');
    }
  }
  res.json({ post });
});

/** POST /api/blog (admin/physio) */
export const createPost = asyncHandler(async (req, res) => {
  const post = await blogModel.createPost({ ...req.body, authorId: req.user.id });
  res.status(201).json({ post });
});

/** PATCH /api/blog/:id (admin/physio) */
export const updatePost = asyncHandler(async (req, res) => {
  const post = await blogModel.updatePost(req.params.id, req.body);
  if (!post) throw ApiError.notFound('Post not found');
  res.json({ post });
});

/** DELETE /api/blog/:id (admin/physio) */
export const deletePost = asyncHandler(async (req, res) => {
  const ok = await blogModel.deletePost(req.params.id);
  if (!ok) throw ApiError.notFound('Post not found');
  res.status(204).send();
});
