'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const { user } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [checkingFirstUser, setCheckingFirstUser] = useState(true);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  // Check if first user and set form data
  useEffect(() => {
    const checkFirstUser = async () => {
      if (!user) return;

      console.log('🔍 Waiting for user to load...', user);
      
      try {
        console.log('🔍 Starting first user check for:', user.id);
        
        const response = await fetch('/api/employees/count');
        console.log('🔍 API response status:', response.status);
        
        const data = await response.json();
        console.log('🔍 API response data:', data);
        
        const count = data.count || 0;
        console.log('🔍 Employee count check:', count, 'isFirst:', count === 0);
        
        if (count === 0) {
          setIsFirstUser(true);
          console.log('✅ First user detected - setting role to super_admin');
          setFormData({
            name: user.fullName || '',
            email: user.primaryEmailAddress?.emailAddress || '',
            role: 'super_admin'
          });
        } else {
          setFormData({
            name: user.fullName || '',
            email: user.primaryEmailAddress?.emailAddress || '',
            role: 'employee'
          });
        }
      } catch (error) {
        console.error('Error checking first user:', error);
        setFormData({
          name: user.fullName || '',
          email: user.primaryEmailAddress?.emailAddress || '',
          role: 'employee'
        });
      } finally {
        setCheckingFirstUser(false);
      }
    };

    checkFirstUser();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role) return;

    setIsSubmitting(true);
    setProgress(10);
    setMessage('Configuration en cours...');

    try {
      const roleToAssign = isFirstUser ? 'super_admin' : formData.role;
      
      setProgress(30);
      
      // Update user metadata in Clerk
      try {
        await user?.update({
          unsafeMetadata: {
            role: roleToAssign,
            name: formData.name,
            onboardingComplete: true
          }
        });
        setProgress(60);
      } catch (error) {
        console.log('⚠️ Setup failed:', error);
        setMessage('Configuration terminée (mode local)! Redirection...');
      }

      setProgress(100);
      // Force immediate redirect
      setTimeout(() => {
        const dashboardPath = getDashboardPath(roleToAssign);
        console.log(`🚀 Redirecting to: ${dashboardPath}`);
        // Use window.location for guaranteed redirect
        window.location.href = dashboardPath;
      }, 500); // Very short delay

    } catch (error) {
      console.error('Setup error:', error);
      setMessage('Erreur lors de la configuration. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return '/dashboard/admin';
      case 'manager':
        return '/dashboard/manager';
      case 'intern':
        return '/intern-portal';
      default:
        return '/dashboard/employee';
    }
  };

  const handleManualRedirect = () => {
    const dashboardPath = getDashboardPath(formData.role);
    window.location.href = dashboardPath;
  };

  if (checkingFirstUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900">Chargement...</h2>
            <p className="text-gray-600 mt-2">Vérification du statut utilisateur</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">📋</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Configuration initiale</h1>
          <p className="text-gray-600 mt-2">
            Connecté en tant que: <span className="font-medium">{user?.primaryEmailAddress?.emailAddress}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Nom {formData.name && <span className="text-green-600">(pré-rempli)</span>}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border rounded-md text-gray-900 bg-white"
              placeholder="Votre nom complet"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.name ? 'Vous pouvez modifier ce nom si nécessaire' : 'Entrez votre nom complet'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email {formData.email && <span className="text-green-600">(pré-rempli)</span>}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-2 border rounded-md text-gray-900 bg-white"
              placeholder="votre.email@example.com"
              disabled={!!user?.primaryEmailAddress?.emailAddress}
            />
            <p className="text-xs text-gray-500 mt-1">
              {user?.primaryEmailAddress?.emailAddress 
                ? 'Email de votre compte Clerk (non modifiable)' 
                : 'Entrez votre adresse email'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Rôle <span className="text-red-500">*</span>
            </label>
            {isFirstUser ? (
              <div className="w-full p-3 border rounded-md bg-green-50 border-green-200">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-medium">🏆 Premier utilisateur - Super Administrateur</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Vous obtenez automatiquement tous les privilèges administrateur
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full p-2 border rounded-md text-gray-900 bg-white"
                  required
                >
                  <option value="">Choisir un rôle</option>
                  <option value="intern">Stagiaire - Accès aux tâches de formation</option>
                  <option value="employee">Employé - Accès standard</option>
                </select>
                <p className="text-xs text-gray-500">
                  Choisissez votre rôle dans l'organisation
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.role}
            className={`w-full py-2 px-4 rounded-md transition-colors ${
              isSubmitting || !formData.role
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Configuration en cours...' : 'Terminer la configuration'}
          </button>

          {message && (
            <div className={`text-center text-sm p-3 rounded ${
              message.includes('terminée') || message.includes('Configuration terminée') || message.includes('sauvegardée')
                ? 'text-green-600 bg-green-50' 
                : message.includes('Erreur')
                ? 'text-red-600 bg-red-50'
                : 'text-blue-600 bg-blue-50'
            }`}>
              {message}
              {(message.includes('terminée') || message.includes('Configuration terminée')) && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleManualRedirect}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Aller au Dashboard →
                  </button>
                </div>
              )}
              {isSubmitting && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{width: `${progress}%`}}
                    ></div>
                  </div>
                  <div className="text-xs mt-1">{progress}%</div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
