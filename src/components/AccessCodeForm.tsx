import { useState } from 'react';
import { Key } from 'lucide-react';

interface AccessCodeFormProps {
  onSuccess: () => void;
}

const AccessCodeForm = ({ onSuccess }: AccessCodeFormProps) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === '2023') {
      onSuccess();
    } else {
      setError('Code incorrect');
      setCode('');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#101D25] to-[#1a2930] flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-[#00B09C]/20 to-[#00B09C]/10 rounded-full blur-3xl opacity-60 animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-l from-[#00B09C]/15 to-[#00B09C]/5 rounded-full blur-3xl opacity-60 animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-tr from-[#00B09C]/20 to-transparent rounded-full blur-3xl opacity-60 animate-pulse delay-1000"></div>
      </div>

      <div className={`w-full max-w-md transform transition-all ${isShaking ? 'animate-shake' : ''} relative z-10`}>
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10">
          {/* Header */}
          <div className="px-8 pt-12 pb-8">
            <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-[#00B09C] to-[#00d4bc] bg-clip-text text-transparent mb-4 font-sans">
              Capture Vision
            </h1>
            <p className="text-center text-[#9FA2A7] text-lg font-medium tracking-wide">
              Entrer le code d'accès
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-12">
            <div className="relative mb-6 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-[#9FA2A7] group-focus-within:text-[#00B09C] transition-colors duration-300" />
              </div>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border-2 border-transparent rounded-2xl backdrop-blur-sm focus:border-[#00B09C] focus:bg-white/10 focus:ring-2 focus:ring-[#00B09C]/30 focus:outline-none transition-all duration-300 text-white placeholder-[#9FA2A7]/50 text-lg"
                placeholder="Code d'accès"
                maxLength={10}
                required
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm text-center mb-4 font-medium animate-fade-in">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00B09C] to-[#00d4bc] hover:from-[#00d4bc] hover:to-[#00B09C] text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 text-lg"
            >
              Accéder
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccessCodeForm;
