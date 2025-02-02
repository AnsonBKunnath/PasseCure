import crypto from 'crypto';
import axios from 'axios';
import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';

const app = express();
app.use(cors());
app.use(express.json());

async function getHashCount(hash: string): Promise<number> {
  const prefix = hash.substring(0, 5);
  const suffix = hash.substring(5).toUpperCase();

  try {
    const response = await axios.get(`https://api.pwnedpasswords.com/range/${prefix}`);
    const hashes = response.data.split('\n');

    for (const hashLine of hashes) {
      const [hashSuffix, count] = hashLine.split(':');
      if (hashSuffix.trim() === suffix) {
        return parseInt(count);
      }
    }
    return 0;
  } catch (error) {
    console.error('Error checking password:', error);
    return 0;
  }
}

app.post('/api/check-password', async (req: Request, res: Response): Promise<any> => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({
      breached: false,
      count: 0,
      message: 'Password is required.',
    });
  }

  // Creating password hash
  const hash = crypto
    .createHash('sha1')
    .update(password)
    .digest('hex')
    .toUpperCase();

  // breach count edukkan
  const breachCount = await getHashCount(hash);
  const response = {
    breached: breachCount > 0,
    count: breachCount,
    message: breachCount > 0
      ? `This password has been seen ${breachCount} times in data breaches.`
      : 'This password hasn\'t been found in any known data breaches.',
  };

  res.json(response);
  console.log('Response:', response);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});