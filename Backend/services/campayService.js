// Campay payment service for initiating and sending payments
const axios = require('axios');

const CAMPAY_BASE_URL = process.env.CAMPAY_BASE_URL || 'https://demo.campay.net/api';
const CAMPAY_API_KEY = process.env.CAMPAY_API_KEY;
const CAMPAY_API_SECRET = process.env.CAMPAY_API_SECRET;

async function getAccessToken() {
  const response = await axios.post(`${CAMPAY_BASE_URL}/token/`, {
    username: CAMPAY_API_KEY,
    password: CAMPAY_API_SECRET
  });
  return response.data.token;
}

async function initiatePayment({ amount, phone, description }) {
  const token = await getAccessToken();
  const response = await axios.post(
    `${CAMPAY_BASE_URL}/collect/`,
    {
      amount,
      currency: 'XAF',
      from: phone,
      description
    },
    {
      headers: { Authorization: `Token ${token}` }
    }
  );
  return response.data;
}

async function sendPayout({ amount, phone, description }) {
  const token = await getAccessToken();
  const response = await axios.post(
    `${CAMPAY_BASE_URL}/send/`,
    {
      amount,
      currency: 'XAF',
      to: phone,
      description
    },
    {
      headers: { Authorization: `Token ${token}` }
    }
  );
  return response.data;
}

module.exports = {
  initiatePayment,
  sendPayout
};
