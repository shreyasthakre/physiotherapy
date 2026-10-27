import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';

const NotFound = () => (
  <>
    <Seo title="Page not found" path="/404" />
    <div className="container-page grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <p className="text-6xl font-extrabold text-brand-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-500">The page you are looking for doesn’t exist or has moved.</p>
        <Link to="/" className="btn-primary mt-8">Back to home</Link>
      </div>
    </div>
  </>
);

export default NotFound;
