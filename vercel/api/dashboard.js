import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

function getFirebaseAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }
}

async function requireUser(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer (.+)$/);
  if (!match) {
    const error = new Error('Missing Authorization bearer token');
    error.statusCode = 401;
    throw error;
  }
  getFirebaseAdmin();
  return getAuth().verifyIdToken(match[1]);
}

function cleanPortfolio(portfolio = {}) {
  const number = (value, max) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > max) return 0;
    return parsed;
  };

  return {
    livret: number(portfolio.livret, 10000000),
    pea: number(portfolio.pea, 10000000),
    usdt: number(portfolio.usdt, 10000000),
    btcEur: number(portfolio.btcEur, 10000000),
    btcQty: number(portfolio.btcQty, 21000000),
    savings: number(portfolio.savings, 10000000),
  };
}

function cleanHistory(history = []) {
  if (!Array.isArray(history)) return [];
  return history.slice(-2000).map((point) => ({
    ts: Number(point.ts),
    total: Number(point.total),
    manual: Boolean(point.manual),
  })).filter((point) => (
    Number.isFinite(point.ts)
    && point.ts > 0
    && Number.isFinite(point.total)
    && point.total >= 0
    && point.total <= 100000000
  ));
}

export default async function handler(req, res) {
  try {
    const user = await requireUser(req);
    const ref = getDatabase().ref(`fire/users/${user.uid}`);

    if (req.method === 'GET') {
      const snapshot = await ref.get();
      return res.status(200).json(snapshot.val() || { portfolio: null, history: [] });
    }

    if (req.method === 'PUT') {
      const payload = req.body || {};
      const value = {
        portfolio: cleanPortfolio(payload.portfolio),
        history: cleanHistory(payload.history),
      };
      await ref.set(value);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: statusCode === 500 ? 'Server error' : error.message });
  }
}
