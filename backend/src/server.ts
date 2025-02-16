import crypto from 'crypto';
import axios from 'axios';
import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';
import { createUser } from './db/index';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

// Encryption functions
const IV_LENGTH = 16; // For AES-256-CBC encryption
const ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_KEY || 'gaisgducbdubifdbfiuQWS354dn')
  .digest('hex')
  .slice(0, 32); // Ensure key is exactly 32 bytes

function encrypt(text: string) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

// Also add a decrypt function for future use:
function decrypt(text: string) {
  try {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

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

app.post('/api/register', async (req: Request, res: Response): Promise<any> => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name and password are required.',
    });
  }

  try {
    const encryptedPassword = encrypt(password);
    await createUser({ name, encrypass: encryptedPassword });
    
    res.json({
      success: true,
      message: 'password added successfully',
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});