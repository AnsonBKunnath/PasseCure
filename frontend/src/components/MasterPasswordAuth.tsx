import { useState } from 'react';

interface MasterPasswordAuthProps {
  onAuthenticate: () => void;
}

const MasterPasswordAuth: React.FC<MasterPasswordAuthProps> = ({ onAuthenticate }) => {
  const [masterPassword, setMasterPassword] = useState('');
  const [error, setError] = useState('');
  
  // This would typically be stored securely or retrieved from a server
  const MASTER_PASSWORD = 'password'; // In a real app, never store plaintext passwords
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (masterPassword === MASTER_PASSWORD) {
      onAuthenticate();
    } else {
      setError('Incorrect master password');
      setTimeout(() => setError(''), 3000);
    }
  };
  
  return (
    <div className="w-full min-h-[600px] bg-black text-white flex flex-col items-center justify-start p-6">
      <div className="mt-20">
        <h1 className="text-2xl font-bold mb-12">PASSECURE</h1>
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="masterPassword" className="block text-sm font-medium mb-2">
                Enter Master Password
              </label>
              <input
                id="masterPassword"
                type="password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                className="w-full bg-transparent border border-white/20 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
                placeholder="Master password"
                autoFocus
              />
            </div>
            
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}
            
            <button
              type="submit"
              className="w-full bg-white text-black px-4 py-2 rounded hover:bg-white/90 transition-colors"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MasterPasswordAuth; 