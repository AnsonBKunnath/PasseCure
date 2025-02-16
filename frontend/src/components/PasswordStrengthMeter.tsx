interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = (): { score: number; feedback: string[] } => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const feedback: string[] = [];
    let score = 0;

    if (!checks.length) feedback.push('At least 8 characters');
    if (!checks.lowercase) feedback.push('Add lowercase letters');
    if (!checks.uppercase) feedback.push('Add uppercase letters');
    if (!checks.numbers) feedback.push('Add numbers');
    if (!checks.special) feedback.push('Add special characters');

    score = Object.values(checks).filter(Boolean).length;

    return { score, feedback };
  };

  const { score, feedback } = calculateStrength();
  const percentage = (score / 5) * 100;

  const getColorClass = () => {
    if (percentage <= 20) return 'bg-red-500';
    if (percentage <= 40) return 'bg-orange-500';
    if (percentage <= 60) return 'bg-yellow-500';
    if (percentage <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full space-y-2">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getColorClass()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {feedback.length > 0 && (
        <ul className="text-xs text-gray-400 space-y-1">
          {feedback.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;