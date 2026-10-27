import { query } from '../db/pool.js';

const BASE_SELECT = `
  SELECT b.*, u.full_name AS author_name
  FROM blog_posts b
  LEFT JOIN users u ON u.id = b.author_id
`;

export const listPublished = async ({ tag } = {}) => {
  const params = [];
  let sql = `${BASE_SELECT} WHERE b.is_published = TRUE`;
  if (tag) {
    params.push(tag);
    sql += ` AND $1 = ANY(b.tags)`;
  }
  sql += ' ORDER BY b.published_at DESC NULLS LAST';
  const { rows } = await query(sql, params);
  return rows;
};

export const listAll = async () => {
  const { rows } = await query(`${BASE_SELECT} ORDER BY b.created_at DESC`);
  return rows;
};

export const getBySlug = async (slug) => {
  const { rows } = await query(`${BASE_SELECT} WHERE b.slug = $1`, [slug]);
  return rows[0] || null;
};

export const createPost = async (data) => {
  const { rows } = await query(
    `INSERT INTO blog_posts (slug, title, excerpt, content, cover_image_url, video_url, tags, author_id, is_published, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, CASE WHEN $9 THEN now() ELSE NULL END)
     RETURNING *`,
    [
      data.slug,
      data.title,
      data.excerpt ?? null,
      data.content,
      data.coverImageUrl ?? null,
      data.videoUrl ?? null,
      data.tags ?? [],
      data.authorId ?? null,
      data.isPublished ?? false,
    ],
  );
  return rows[0];
};

export const updatePost = async (id, data) => {
  const { rows } = await query(
    `UPDATE blog_posts SET
       title = COALESCE($2, title),
       excerpt = COALESCE($3, excerpt),
       content = COALESCE($4, content),
       cover_image_url = COALESCE($5, cover_image_url),
       video_url = COALESCE($6, video_url),
       tags = COALESCE($7, tags),
       is_published = COALESCE($8, is_published),
       published_at = CASE
         WHEN $8 IS TRUE AND published_at IS NULL THEN now()
         ELSE published_at
       END
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.title ?? null,
      data.excerpt ?? null,
      data.content ?? null,
      data.coverImageUrl ?? null,
      data.videoUrl ?? null,
      data.tags ?? null,
      data.isPublished ?? null,
    ],
  );
  return rows[0] || null;
};

export const deletePost = async (id) => {
  const { rowCount } = await query('DELETE FROM blog_posts WHERE id = $1', [id]);
  return rowCount > 0;
};
