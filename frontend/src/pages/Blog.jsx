import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import { Section, SectionHeading } from '../components/Section.jsx';
import { useFetch } from '../lib/useFetch.js';
import { IconArrow } from '../components/icons.jsx';

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-AU', { dateStyle: 'medium' }) : '';

const Blog = () => {
  const { data: posts, loading, error } = useFetch('/blog', { select: (d) => d.posts });

  return (
    <>
      <Seo
        title="Resources & Blog"
        description="Physiotherapy tips, recovery guides, and exercise videos from our clinical team."
        path="/blog"
      />

      <div className="section-band">
        <div className="container-page py-16">
          <SectionHeading
            eyebrow="Resources"
            title="Tips, guides & recovery videos"
            subtitle="Practical, physiotherapist-approved advice to support your recovery at home."
          />
        </div>
      </div>

      <Section className="pt-12">
        {error && <Alert type="error">{error.message}</Alert>}
        {loading ? (
          <Spinner />
        ) : posts && posts.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-soft">
                {post.cover_image_url && (
                  <Link to={`/blog/${post.slug}`} className="aspect-[16/9] overflow-hidden">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </Link>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap gap-2">
                    {(post.tags || []).slice(0, 2).map((t) => (
                      <span key={t} className="badge">{t}</span>
                    ))}
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-slate-900">
                    <Link to={`/blog/${post.slug}`} className="hover:text-brand-700">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-500">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-slate-400">{formatDate(post.published_at)}</span>
                    <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:gap-2">
                      Read <IconArrow />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No articles published yet. Check back soon!</p>
        )}
      </Section>
    </>
  );
};

export default Blog;
