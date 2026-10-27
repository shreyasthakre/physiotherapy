import { useParams, Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import { useFetch } from '../lib/useFetch.js';
import { IconArrow } from '../components/icons.jsx';

const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-AU', { dateStyle: 'long' }) : '';

/** Very small markdown-ish renderer for headings + paragraphs. */
const renderContent = (content = '') =>
  content.split('\n').filter(Boolean).map((line, i) => {
    if (line.startsWith('### ')) {
      return <h3 key={i} className="mt-6 text-xl font-bold text-slate-900">{line.slice(4)}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={i} className="mt-8 text-2xl font-bold text-slate-900">{line.slice(3)}</h2>;
    }
    if (line.startsWith('- ')) {
      return <li key={i} className="ml-5 list-disc text-slate-600">{line.slice(2)}</li>;
    }
    return <p key={i} className="text-slate-600">{line}</p>;
  });

const BlogPost = () => {
  const { slug } = useParams();
  const { data: post, loading, error } = useFetch(`/blog/${slug}`, { select: (d) => d.post });

  if (loading) {
    return (
      <div className="container-page py-24">
        <Spinner />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container-page py-24">
        <Alert type="error">{error?.message || 'Article not found.'}</Alert>
        <Link to="/blog" className="mt-4 inline-flex items-center gap-1 text-brand-700">
          <IconArrow className="rotate-180" /> Back to resources
        </Link>
      </div>
    );
  }

  return (
    <>
      <Seo
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
        image={post.cover_image_url}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.excerpt,
          image: post.cover_image_url,
          datePublished: post.published_at,
          author: { '@type': 'Organization', name: 'The Physiotherapy Clinic' },
        }}
      />

      <article className="container-page max-w-3xl py-14">
        <Link to="/blog" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
          <IconArrow className="rotate-180" /> All resources
        </Link>

        <div className="flex flex-wrap gap-2">
          {(post.tags || []).map((t) => (
            <span key={t} className="badge">{t}</span>
          ))}
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">{post.title}</h1>
        <p className="mt-3 text-sm text-slate-400">
          {formatDate(post.published_at)}
          {post.author_name ? ` · by ${post.author_name}` : ''}
        </p>

        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="mt-8 w-full rounded-3xl object-cover shadow-soft"
          />
        )}

        <div className="mt-8 space-y-4 text-lg leading-relaxed">{renderContent(post.content)}</div>

        {post.video_url && (
          <div className="mt-10">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">Watch the exercises</h2>
            <div className="aspect-video overflow-hidden rounded-2xl shadow-soft">
              <iframe
                className="h-full w-full"
                src={post.video_url}
                title={`${post.title} — video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </article>
    </>
  );
};

export default BlogPost;
