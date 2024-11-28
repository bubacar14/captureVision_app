import { useState } from 'react';

interface SecretCodeProps {
  onSuccess: () => void;
}

const SecretCode: React.FC<SecretCodeProps> = ({ onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  
  // Code secret défini en dur (dans un vrai projet, cela devrait être géré de manière plus sécurisée)
  const SECRET_CODE = '2023';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === SECRET_CODE) {
      onSuccess();
    } else {
      setError('Code incorrect. Veuillez réessayer.');
      setCode('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              CaptureVision
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Veuillez entrer le code d'accès
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-center text-lg tracking-widest"
                placeholder="• • • •"
                required
                maxLength={4}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Valider
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SecretCode;
