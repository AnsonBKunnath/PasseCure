import React, { useState } from 'react';

const PasswordSecurityApp = () => {
  const [password, setPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [breachResult, setBreachResult] = useState<{
    breached: boolean;
    count: number;
    message: string;
  } | null>(null);

  const checkPassword = async () => {
    if (!password) return;

    setIsChecking(true);
    try {
      const response = await fetch('http://localhost:3000/api/check-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      setBreachResult(data);
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
            placeholder="enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
          />
        </div>

        <button type='button'
          onClick={checkPassword}
          disabled={isChecking}
          className="bg-white text-black px-8 py-2 rounded text-sm hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'check'}
        </button>

        {breachResult && (
          <div className={`text-center ${breachResult.breached ? 'text-red-500' : 'text-green-500'} font-medium`}>
            {breachResult.breached ? 'PASSWORD HAS BEEN BREACHED!' : 'Password is secure'}
            {breachResult.count > 0 && (
              <div className="text-sm mt-1">
                Found in {breachResult.count.toLocaleString()} data breaches
              </div>
            )}
          </div>
        )}

        <button type='button'
          className="w-[80%] border border-white rounded-full py-2 px-4 hover:bg-white/10 transition-colors"
        >
          ADD PASSWORD
        </button>
      </div>
    </div>
  );
};

export default PasswordSecurityApp;