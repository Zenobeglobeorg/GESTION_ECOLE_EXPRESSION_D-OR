import { useState } from 'react';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Bienvenue sur Connect School",
      description: "La plateforme de gestion complète pour gerer votre établissement scolaire.",
      buttonText: "Continuer",
      buttonAction: () => setCurrentSlide(1),
    },
    // {
    //   title: "Gestion simplifiée de votre école",
    //   description: "Suivez les présences, les notes, les évaluations et les bulletins. Communiquez efficacement avec les parents et coordonnez les équipes pédagogiques.",
    //   buttonText: "Commencer",
    //   buttonAction: () => setCurrentSlide(2),
    // },
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
      {/*<div className="absolute top-0 left-0 right-0 h-8 bg-black/20 flex items-center justify-between px-4 text-white text-xs z-10">
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
      </div>*/}

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

      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-300/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse-slow delay-500"></div>

      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative z-0 pt-12">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center animate-fade-in">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center mb-4 transform hover:scale-105 transition-transform duration-300 hover:rotate-3">
            <img src="/logo-expression-or.jpg" alt="Pilote School Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg tracking-wide">Connect School</h1>
        </div>

        {/* Content with glassmorphism background */}
        <div className="max-w-md w-full text-center mb-8 backdrop-blur-lg bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 animate-slide-up">
          <h2 className="text-3xl font-bold text-white mb-4 leading-tight drop-shadow-md">
            {currentSlideData.title}
          </h2>
          {currentSlide === 1 ? (
            /* Slide connexion : boutons par profil à la place de la description */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <Link to="/login" state={{ roleHint: 'PARENT' }} className="block">
                <button type="button" className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-105 border border-white/30">
                  👨‍👩‍👧 Parent
                </button>
              </Link>
              <Link to="/login" state={{ roleHint: 'TEACHER' }} className="block">
                <button type="button" className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-105 border border-white/30">
                  📚 Enseignant
                </button>
              </Link>
              <Link to="/login" state={{ roleHint: 'ADMINISTRATION' }} className="block">
                <button type="button" className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:scale-105 border border-white/30">
                  ⚙️ Admin
                </button>
              </Link>
            </div>
          ) : (
            <p className="text-white/95 text-lg leading-relaxed drop-shadow">
              {currentSlideData.description}
            </p>
          )}
        </div>

        {/* Terms (affiché uniquement sur la slide connexion) */}
        {currentSlide === 1 && (
          <div className="w-full max-w-md mb-4 animate-fade-in">
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/20">
              <p className="text-white/90 text-xs text-center">
                En vous connectant ou en sautant cette étape, vous acceptez les{' '}
                <Link to="/terms" className="text-yellow-300 underline font-semibold hover:text-yellow-200 transition-colors">
                  Conditions d'utilisation
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* Action Button (bouton "Continuer" pour les autres slides) */}
        {currentSlide !== 1 ? (
          <button
            onClick={currentSlideData.buttonAction}
            className="w-full max-w-md bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 uppercase tracking-wide"
          >
            {currentSlideData.buttonText}
          </button>
        ) : null}

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-8 backdrop-blur-md bg-white/10 rounded-full px-4 py-2 border border-white/20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-yellow-400 w-8 h-2 shadow-lg'
                  : 'bg-white/50 hover:bg-white/75 w-2 h-2'
              }`}
              aria-label={`Aller à la slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
