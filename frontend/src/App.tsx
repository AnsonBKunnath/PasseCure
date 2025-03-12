import { useState, useEffect } from 'react';
import PasswordStrengthMeter from './components/PasswordStrengthMeter';
import MasterPasswordAuth from './components/MasterPasswordAuth';
import Draggable from 'react-draggable';
const DraggableComponent = Draggable as any;

interface SavedPassword {
  id: number;
  name: string;
  password: string;
}

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
  const [showPasswords, setShowPasswords] = useState(false);
  const [savedPasswords, setSavedPasswords] = useState<SavedPassword[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch('http://localhost:3000/api/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      setBreachResult(data);
    } catch (error) {
      console.error('Error checking password:', error);
      setBreachResult({ breached: false, count: 0, message: 'Error checking password. Please try again.' });
    } finally {
      setIsChecking(false);
    }
  };

  const sendCurrentUrl = () => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs: any[]) => {
      const currentTab = tabs[0];
      if (currentTab?.url) setName(currentTab.url);
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      sendCurrentUrl();
      chrome.tabs.onActivated.addListener(sendCurrentUrl);
      (chrome.tabs as any).onUpdated.addListener(sendCurrentUrl);
      return () => {
        chrome.tabs.onActivated.removeListener(sendCurrentUrl);
        (chrome.tabs as any).onUpdated.removeListener(sendCurrentUrl);
      };
    }
  }, [isAuthenticated]);

  const fetchPasswords = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/passwords');
      const data = await response.json();
      setSavedPasswords(data);
    } catch (error) {
      console.error('Error fetching passwords:', error);
    }
  };

  const deletePassword = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/passwords/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) setSavedPasswords(passwords => passwords.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting password:', error);
    }
  };

  useEffect(() => {
    if (showPasswords && isAuthenticated) fetchPasswords();
  }, [showPasswords, isAuthenticated]);

  // Handle authentication
  const handleAuthenticate = () => {
    setIsAuthenticated(true);
  };

  // If not authenticated, show the master password screen
  if (!isAuthenticated) {
    return <MasterPasswordAuth onAuthenticate={handleAuthenticate} />;
  }

  // Get breach message based on password strength and breach status
  const getBreachMessage = () => {
    if (!breachResult) return null;
    
    if (breachResult.breached) {
      return 'PASSWORD HAS BEEN BREACHED!';
    } else if (passwordStrength === 5) {
      return 'Password has not been found in any breaches';
    } else {
      return 'Password has not been breached but is still insecure';
    }
  };

  return (
    <div className="w-[400px] h-[600px] bg-black text-white flex flex-col items-center p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-8">PASSECURE</h1>
      <DraggableComponent>
        <div className="cursor-move">
          <img src="/vite.svg" alt="Passecure Icon" className="w-12 h-12" />
        </div>
      </DraggableComponent>

      <div className="w-full flex flex-col items-center gap-6">
        <div className="w-full">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border border-white/20 rounded px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
          />
          <PasswordStrengthMeter 
            password={password} 
            onStrengthChange={setPasswordStrength}
          />
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
          <div className={`text-center ${breachResult.breached ? 'text-red-500' : (passwordStrength === 5 ? 'text-green-500' : 'text-yellow-500')} font-medium`}>
            {getBreachMessage()}
            {breachResult.count > 0 && (
              <div className="text-sm mt-1">Found in {breachResult.count.toLocaleString()} data breaches</div>
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
              onClick={sendCurrentUrl}
              className="bg-blue-500 text-white px-6 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              Use Current URL
            </button>
            <button
              onClick={handleRegister}
              className="bg-green-500 text-white px-6 py-2 rounded text-sm hover:bg-green-600 transition-colors"
            >
              Add
            </button>
          </div>
        )}

        {registrationStatus && (
          <div className="text-center text-sm mt-2">{registrationStatus}</div>
        )}

        <button
          onClick={() => setShowPasswords(!showPasswords)}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
        >
          {showPasswords ? 'Hide Saved Passwords' : 'Show Saved Passwords'}
        </button>
      </div>

      {showPasswords && (
        <div className="w-full mt-8 mb-4 max-h-[300px] overflow-y-auto">
          {savedPasswords.map((p) => (
            <div key={p.id} className="flex items-center justify-between bg-white/10 rounded p-2 mb-2">
              <div className="overflow-hidden">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-xs truncate">{p.password}</div>
              </div>
              <button onClick={() => deletePassword(p.id)} className="text-red-500 text-sm ml-2 flex-shrink-0">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordSecurityApp;
