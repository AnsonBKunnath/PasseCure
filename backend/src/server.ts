import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON body

// Example list of breached passwords
const breachedPasswords = ['123456', 'password', '123456789'];

app.post('/api/check-password',async(req: Request, res: Response):Promise<any> => {
  const { password } = req.body;

  // Check if password is provided
  if (!password) {
    return res.status(400).json({
      breached: false,
      count: 0,
      message: 'Password is required.',
    });
  }

  // Check if the password is in the breached passwords list
  const isBreached = breachedPasswords.includes(password);

  // Construct response
  const response = {
    breached: isBreached,
    count: isBreached ? 1 : 0, // Simulated breach count
    message: isBreached
      ? 'The password has been found in previous data breaches.'
      : 'The password is secure.',
  };

  // Send response to frontend
  res.json(response);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
