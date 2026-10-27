import crypto from 'node:crypto';
import config from '../config/index.js';
import logger from './logger.js';

/**
 * Subscribe an email to the configured Mailchimp audience using the
 * Marketing API (v3). When credentials are missing we log and return a
 * "console" result so the newsletter form works in development.
 */
export const subscribeToNewsletter = async ({ email, firstName }) => {
  const { apiKey, serverPrefix, listId } = config.mailchimp;

  if (!apiKey || !serverPrefix || !listId) {
    logger.info(`[mailchimp:console] Would subscribe ${email}`);
    return { subscribed: false, mode: 'console' };
  }

  const subscriberHash = crypto
    .createHash('md5')
    .update(email.toLowerCase())
    .digest('hex');

  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
    },
    body: JSON.stringify({
      email_address: email,
      status_if_new: 'subscribed',
      merge_fields: firstName ? { FNAME: firstName } : undefined,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Mailchimp error ${response.status}: ${detail}`);
  }

  return { subscribed: true, mode: 'mailchimp' };
};
