import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const LoginPage = () => {
  const { login, verifyTwoFactor, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  
  // 2FA state
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorEmailSent, setTwoFactorEmailSent] = useState(false);

  const checkPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) {
      setPasswordStrength('');
      return { isValid: false, score: 0 };
    }

    const checks = {
      length: pwd.length >= 8,
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd)
    };

    let score = 0;
    if (checks.length) score++;
    if (checks.lowercase) score++;
    if (checks.uppercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    let level = '';
    let color = '';
    if (score < 3) {
      level = 'Faible';
      color = '#ef4444';
    } else if (score === 3) {
      level = 'Moyen';
      color = '#f59e0b';
    } else if (score === 4) {
      level = 'Bon';
      color = '#10b981';
    } else {
      level = 'Excellent';
      color = '#059669';
    }

    setPasswordStrength(`${score * 20}%|${level}|${color}`);
    return { isValid: score >= 3, score };
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    checkPasswordStrength(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const strength = checkPasswordStrength(password);
    if (!strength.isValid) {
      setError('Le mot de passe ne remplit pas les conditions de sécurité requises.');
      return;
    }

    try {
      const result = await login(email, password);

      // Si la 2FA est requise
      if (result && 'requiresTwoFactor' in result && result.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        setTwoFactorEmailSent(result.emailSent || false);
        // En mode développement, afficher le code dans la console
        if (result.devCode) {
          console.log('📧 [DEV] Code 2FA:', result.devCode);
        }
        return;
      }

      // Si pas de 2FA, connexion normale - la redirection sera gérée par ProtectedRoute
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la connexion. Veuillez réessayer.';
      setError(errorMessage);
    }
  };

  const handleVerifyTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTwoFactorLoading(true);

    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres');
      setTwoFactorLoading(false);
      return;
    }

    try {
      await verifyTwoFactor(email, twoFactorCode);
      // Connexion réussie - la redirection sera gérée par ProtectedRoute
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification du code';
      setError(errorMessage);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const strengthInfo = passwordStrength.split('|');
  const strengthWidth = strengthInfo[0] || '0%';
  const strengthLevel = strengthInfo[1] || '';

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 via-blue-500 to-yellow-400 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-300/10 rounded-full blur-3xl animate-pulse-slow delay-500"></div>
      
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full relative z-10 border border-white/20 animate-fade-in">
        {/* Logo circulaire */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-white shadow-xl flex items-center justify-center overflow-hidden border-2 border-blue-100 rounded-2xl transform hover:scale-105 transition-transform duration-300">
            <img src="/logo-expression-or.jpg" alt="Pilote School Logo" className="w-20 h-20 object-contain" />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-blue-800 drop-shadow-sm">
            Pilote School
          </h2>
          <p className="text-gray-600 text-sm">Accédez à votre espace personnel</p>
        </div>

        {!requiresTwoFactor ? (
          /* Formulaire de connexion */
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Identifiant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Identifiant
                </span>
              </label>
              <Input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email ou identifiant"
                required
                className="w-full"
              />
            </div>

            {/* Mot de passe avec visibilité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Mot de passe
                </span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      {/* eslint-disable-next-line react/forbid-dom-props */}
                      <div
                        className={`h-full transition-all duration-300 ${
                          strengthLevel === 'Faible' ? 'bg-red-500' :
                          strengthLevel === 'Moyen' ? 'bg-yellow-500' :
                          strengthLevel === 'Bon' ? 'bg-green-500' :
                          'bg-green-600'
                        }`}
                        style={{ width: strengthWidth }}
                        title={`Force du mot de passe: ${strengthLevel}`}
                      />
                    </div>
                    <span 
                      className={`text-xs font-semibold ${
                        strengthLevel === 'Faible' ? 'text-red-500' :
                        strengthLevel === 'Moyen' ? 'text-yellow-500' :
                        strengthLevel === 'Bon' ? 'text-green-500' :
                        'text-green-600'
                      }`}
                      title={strengthLevel}
                    >
                      {strengthLevel}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bouton de connexion */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] uppercase tracking-wide"
              disabled={isLoading}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                {isLoading ? 'CONNEXION...' : 'SE CONNECTER'}
              </span>
            </Button>

            {/* Lien mot de passe oublié */}
            <div className="text-center">
              <Link to="/forgot-password" className="text-sm hover:underline text-blue-800 font-medium transition-colors hover:text-blue-600">
                Mot de passe oublié ?
              </Link>
            </div>
          </form>
        ) : (
          /* Formulaire de vérification 2FA */
          <form onSubmit={handleVerifyTwoFactor} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium mb-1">🔐 Vérification requise</p>
              <p>
                {twoFactorEmailSent
                  ? 'Un code de vérification a été envoyé à votre adresse email. Vérifiez votre boîte de réception.'
                  : 'Un code de vérification a été généré. Vérifiez votre email ou la console (mode développement).'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Code de vérification
                </span>
              </label>
              <Input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
                maxLength={6}
                className="w-full text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Entrez le code à 6 chiffres reçu par email. Le code est valide pendant 10 minutes.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={twoFactorLoading}
              disabled={twoFactorCode.length !== 6}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 disabled:opacity-50 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] uppercase tracking-wide"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                VÉRIFIER
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRequiresTwoFactor(false);
                setTwoFactorCode('');
                setError('');
              }}
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
            >
              Retour
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
