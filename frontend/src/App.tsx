import { useState } from 'react';
import PasswordStrengthMeter from './components/PasswordStrengthMeter';
//import { supabase } from '../services/supabase';

const PasswordSecurityApp = () => {
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState('');
  const [breachResult, setBreachResult] = useState<{
    breached: boolean;
    count: number;
    message: string;
  } | null>(null);

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();
      setRegistrationStatus(data.message);
      if (data.success) {
        setName('');
        setPassword('');
        setShowRegistration(false);
      }
    } catch (error) {
      console.error('Error adding:', error);
      setRegistrationStatus('Adding failed. Please try again.');
    }
  };

  const checkPassword = async () => {
    if (!password) return;

    setIsChecking(true);
    try {
      // Send the password to the backend
      const response = await fetch('http://localhost:3000/api/check-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      // Parse the response from the backend
      const data = await response.json();
      console.log(data);
      setBreachResult(data); // Set the response data to breachResult
    } catch (error) {
      console.error('Error checking password:', error);
      setBreachResult({
        breached: false,
        count: 0,
        message: 'Error checking password. Please try again.',
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="w-[400px] min-h-[500px] bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold mb-8">PASSECURE</h1>

      <div className="w-full flex flex-col items-center gap-6">
        <div className="w-full">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <button
          type="button"
          onClick={checkPassword}
          disabled={isChecking}
          className="bg-white text-black px-8 py-2 rounded text-sm hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Check'}
        </button>

        {breachResult && (
          <div
            className={`text-center ${
              breachResult.breached ? 'text-red-500' : 'text-green-500'
            } font-medium`}
          >
            {breachResult.breached
              ? 'PASSWORD HAS BEEN BREACHED!'
              : 'Password has not been found in any breaches'}
            {breachResult.count > 0 && (
              <div className="text-sm mt-1">
                Found in {breachResult.count.toLocaleString()} data breaches
              </div>
            )}
            
            {!breachResult.breached && !showRegistration && (
              <button
                onClick={() => setShowRegistration(true)}
                className="mt-4 bg-green-500 text-white px-6 py-2 rounded text-sm hover:bg-green-600 transition-colors"
              >
                Add Password to Database
              </button>
            )}
          </div>
        )}

        {showRegistration && (
          <div className="w-full flex flex-col gap-4">
            <input
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border border-white/20 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
            />
            <button
              onClick={handleRegister}
              className="bg-green-500 text-white px-6 py-2 rounded text-sm hover:bg-green-600 transition-colors"
            >
              Register
            </button>
          </div>
        )}

        {registrationStatus && (
          <div className="text-center text-sm mt-2">
            {registrationStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordSecurityApp;
