const { PayOS } = require('@payos/node');

// PayOS Configuration
const payOSConfig = {
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
  partnerCode: process.env.PAYOS_PARTNER_CODE,
  baseURL: process.env.PAYOS_BASE_URL
};

// Initialize PayOS instance using new SDK signature
const payOS = new PayOS({
  clientId: payOSConfig.clientId,
  apiKey: payOSConfig.apiKey,
  checksumKey: payOSConfig.checksumKey,
  partnerCode: payOSConfig.partnerCode,
  baseURL: payOSConfig.baseURL
});

module.exports = {
  payOS,
  payOSConfig
};
