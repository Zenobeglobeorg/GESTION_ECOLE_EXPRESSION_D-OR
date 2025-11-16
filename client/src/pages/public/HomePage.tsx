import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-100 via-white to-blue-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2">
        <div className="p-10 flex flex-col justify-center bg-linear-to-br from-yellow-400 via-yellow-300 to-yellow-500 text-blue-900">
          <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight">
            Bienvenue sur Express<span className="text-blue-900">'</span>Or
          </h1>
          <p className="text-lg leading-relaxed">
            La plateforme de gestion complète pour votre établissement scolaire. Suivi des élèves, coordination des équipes,
            communication centralisée et statistiques en temps réel.
          </p>
        </div>
        <div className="p-10 flex flex-col justify-center gap-8 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Commencez dès maintenant</h2>
            <p className="text-gray-600">
              Accédez à votre tableau de bord pour gérer l&apos;administration, les enseignants, les parents et les élèves en toute simplicité.
            </p>
          </div>

          <div className="space-y-4">
            <Link to="/login" className="block">
              <Button
                size="lg"
                className="w-full text-white font-semibold"
                style={{ backgroundColor: '#fbbf24' }}
              >
                Se connecter
              </Button>
            </Link>

            <p className="text-sm text-gray-500 text-center">
              Besoin d&apos;aide pour vous connecter ? Contactez l&apos;administration de votre établissement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


