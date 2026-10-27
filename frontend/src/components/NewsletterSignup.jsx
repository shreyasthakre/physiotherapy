import { useState } from 'react';
import api from '../lib/api.js';
import { trackEvent } from '../lib/analytics.js';

const NewsletterSignup = ({ compact = false }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      await api.post('/newsletter', { email });
      trackEvent('newsletter_signup');
      setStatus('success');
      setMessage('You are subscribed — welcome aboard!');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Subscription failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? '' : 'mx-auto max-w-md'} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`newsletter-${compact ? 'compact' : 'full'}`} className="sr-only">
          Email address
        </label>
        <input
          id={`newsletter-${compact ? 'compact' : 'full'}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input"
          aria-describedby="newsletter-status"
        />
        <button type="submit" className="btn-secondary whitespace-nowrap" disabled={status === 'loading'}>
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {message && (
        <p
          id="newsletter-status"
          className={`mt-2 text-sm ${status === 'error' ? 'text-red-600' : 'text-teal-700'}`}
          role={status === 'error' ? 'alert' : 'status'}
        >
          {message}
        </p>
      )}
    </form>
  );
};

export default NewsletterSignup;
