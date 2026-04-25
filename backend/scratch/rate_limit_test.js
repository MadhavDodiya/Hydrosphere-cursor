import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/register';

async function spamSignup() {
  console.log("🚀 Starting spam test on /api/auth/register...");
  for (let i = 1; i <= 25; i++) {
    try {
      const response = await axios.post(API_URL, {
        name: `Test User ${i}`,
        email: `test${i}@example.com`,
        password: 'password123',
        role: 'buyer'
      });
      console.log(`[${i}] Success: ${response.status}`);
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(`🛑 [${i}] RATE LIMITED: ${error.response.status} - ${error.response.data.message}`);
        break;
      } else {
        console.log(`❌ [${i}] Error: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      }
    }
  }
}

spamSignup();
