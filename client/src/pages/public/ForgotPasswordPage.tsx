import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Veuillez entrer votre email');
      return;
    }

    setIsLoading(true);
    try {
      const result = await forgotPassword(email);
      // Vérifier si l'email a été envoyé avec succès
      if (result.success === false) {
        setError(result.error || result.message || 'Erreur lors de l\'envoi de l\'email. Veuillez contacter l\'administration.');
      } else {
        setMessage(result.message || 'Si cet email existe, un lien de réinitialisation a été envoyé.');
        setEmail(''); // Réinitialiser le champ email
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la demande de réinitialisation';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden border-2 border-blue-100">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-2xl font-bold">
              E
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#1e40af' }}>
            Mot de passe oublié ?
          </h2>
          <p className="text-gray-600 text-sm">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold">Email envoyé !</p>
                  <p className="mt-1">{message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                Adresse email
              </span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@example.com"
              required
              className="w-full"
              disabled={isLoading || !!message}
            />
          </div>

          {/* Bouton */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full"
            style={{ backgroundColor: '#fbbf24' }}
            disabled={!!message}
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Envoyer le lien de réinitialisation
            </span>
          </Button>

          {/* Retour à la connexion */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm hover:underline"
              style={{ color: '#1e40af' }}
            >
              ← Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

