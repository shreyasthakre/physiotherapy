import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'The Physiotherapy Clinic';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';

/**
 * Centralised SEO component: sets title, meta description, Open Graph,
 * Twitter cards, canonical URL, and optional JSON-LD structured data.
 */
const Seo = ({
  title,
  description = 'Expert physiotherapy plus TECAR, laser, IFT, ultrasound, TENS, and shockwave. Sports rehab, post-surgery recovery, and chronic pain care. Book online.',
  path = '/',
  image = `${SITE_URL}/favicon.svg`,
  type = 'website',
  jsonLd,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Move Better, Live Better`;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
};

export default Seo;
