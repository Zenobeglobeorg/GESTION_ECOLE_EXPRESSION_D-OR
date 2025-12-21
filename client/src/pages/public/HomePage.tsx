import { useState } from 'react';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Bienvenue sur Pilote School",
      description: "La plateforme de gestion complète pour votre établissement scolaire. Gérez les élèves, les enseignants, les parents et l'administration en toute simplicité.",
      buttonText: "Continuer",
      buttonAction: () => setCurrentSlide(1),
    },
    {
      title: "Gestion simplifiée de votre école",
      description: "Suivez les présences, les notes, les évaluations et les bulletins. Communiquez efficacement avec les parents et coordonnez les équipes pédagogiques.",
      buttonText: "Commencer",
      buttonAction: () => setCurrentSlide(2),
    },
    {
      title: "Connectez-vous à votre compte",
      description: "Accédez à votre tableau de bord personnalisé selon votre rôle : administrateur, enseignant ou parent.",
      buttonText: "Se connecter",
      buttonAction: () => {},
    },
  ];

  const currentSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 via-blue-500 to-yellow-400 relative overflow-hidden">
      {/* Status bar simulation (mobile) */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-black/20 flex items-center justify-between px-4 text-white text-xs z-10">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2 border border-white rounded-sm">
            <div className="w-3 h-1.5 bg-white rounded-sm m-0.5"></div>
          </div>
          <div className="w-1 h-3 bg-white rounded-full"></div>
          <div className="w-6 h-3 border border-white rounded-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-white w-[70%]"></div>
          </div>
        </div>
      </div>

      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-4 gap-8 p-8">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-square bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative z-0">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center mb-4 transform hover:scale-105 transition-transform">
            {/*<svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>*/}
            <img src="/logo-expression-or.jpg" alt="" />
          </div>
          <h1 className="text-3xl font-bold text-white">PILOTE SCHOOL</h1>
        </div>

        {/* Content */}
        <div className="max-w-md w-full text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            {currentSlideData.title}
          </h2>
          <p className="text-white/90 text-lg leading-relaxed">
            {currentSlideData.description}
          </p>
        </div>

        {/* Action Button */}
        {currentSlide === 2 ? (
          <div className="w-full max-w-md space-y-4">
            {/* Social Login Buttons */}
            {/*<div className="space-y-3 mb-4">
              <Link to="/login" className="block">
                <button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continuer avec Facebook
                </button>
              </Link>
              <Link to="/login" className="block">
                <button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-3 shadow-lg transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuer avec Google
                </button>
              </Link>
            </div>*/}

            {/* Direct Login Link */}
            <Link to="/login" className="block">
              <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-4 rounded-xl shadow-lg transition-colors uppercase tracking-wide">
                {currentSlideData.buttonText}
              </button>
            </Link>

            {/* Terms */}
            <p className="text-white/80 text-xs text-center mt-6">
              En vous connectant ou en sautant cette étape, vous acceptez les{' '}
              <Link to="/terms" className="text-yellow-300 underline">
                Conditions d'utilisation
              </Link>
            </p>
          </div>
        ) : (
          <button
            onClick={currentSlideData.buttonAction}
            className="w-full max-w-md bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-4 rounded-xl shadow-lg transition-colors uppercase tracking-wide"
          >
            {currentSlideData.buttonText}
          </button>
        )}

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-yellow-400 w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Aller à la slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
