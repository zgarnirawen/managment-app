'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    role: '',
    name: '',
    email: ''
  });
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-populate user data from Clerk when available
  useEffect(() => {
    if (isLoaded && user) {
      const userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.lastName || '';
      
      const userEmail = user.primaryEmailAddress?.emailAddress || '';

      setFormData(prev => ({
        ...prev,
        name: userName,
        email: userEmail
      }));
    }
  }, [isLoaded, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role) {
      setMessage('Veuillez sélectionner un rôle');
      return;
    }

    // Name defaults to Clerk name if not provided
    const finalName = formData.name || 'Utilisateur';
    // Email defaults to Clerk email if not provided  
    const finalEmail = formData.email || user?.primaryEmailAddress?.emailAddress || '';

    try {
      setIsSubmitting(true);
      setMessage('Configuration en cours...');

      // Try to save to Clerk metadata if possible
      try {
        const response = await fetch('/api/setup-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: formData.role })
        });

        if (response.ok) {
          console.log('✅ Role saved to Clerk metadata');
        } else {
          console.log('⚠️ Clerk metadata save failed, using localStorage fallback');
        }
      } catch (error) {
        console.log('⚠️ Clerk API unavailable, using localStorage');
      }

      // Always save to localStorage as backup
      localStorage.setItem('userRole', formData.role);
      localStorage.setItem('userName', finalName);
      localStorage.setItem('userEmail', finalEmail);
      localStorage.setItem('setupComplete', 'true');

      setMessage('Configuration terminée! Redirection vers le tableau de bord...');
      
      // Use router for navigation (more reliable than window.location)
      setTimeout(() => {
        const dashboardPath = getDashboardPath(formData.role);
        router.push(dashboardPath);
      }, 1500);

    } catch (error) {
      console.error('Setup error:', error);
      setMessage('Erreur lors de la configuration. Veuillez réessayer.');
      setIsSubmitting(false);
    }
  };

  const getDashboardPath = (role: string) => {
    switch (role) {
      case 'admin': return '/dashboard/admin';
      case 'manager': return '/dashboard/manager';
      case 'employee': return '/dashboard/employee';
      case 'intern': return '/intern-portal';
      default: return '/dashboard';
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-lg">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow text-gray-900">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Configuration initiale</h1>
        
        {/* Show user info if available */}
        {user && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              Connecté en tant que: <span className="font-medium">{user.primaryEmailAddress?.emailAddress}</span>
            </p>
          </div>
        )}
        
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
              placeholder="Votre nom"
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
                : 'Entrez votre adresse email'
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Rôle <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                { value: 'admin', label: 'Administrateur', desc: 'Accès complet au système' },
                { value: 'manager', label: 'Manager', desc: 'Gestion des équipes et projets' },
                { value: 'employee', label: 'Employé', desc: 'Suivi du temps et des tâches' },
                { value: 'intern', label: 'Stagiaire', desc: 'Accès limité aux fonctionnalités' }
              ].map((role) => (
                <label key={role.value} className="flex items-start text-gray-700 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="mr-3 mt-1"
                  />
                  <div>
                    <div className="font-medium">{role.label}</div>
                    <div className="text-sm text-gray-500">{role.desc}</div>
                  </div>
                </label>
              ))}
            </div>
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
              message.includes('terminée') || message.includes('Configuration terminée')
                ? 'text-green-600 bg-green-50' 
                : message.includes('Erreur')
                ? 'text-red-600 bg-red-50'
                : 'text-blue-600 bg-blue-50'
            }`}>
              {message}
            </div>
          )}
        </form>

        {/* Quick access links - only show if not submitting */}
        {!isSubmitting && (
          <div className="mt-6 pt-4 border-t text-center space-y-2">
            <div className="text-sm text-gray-500">
              Liens de navigation rapide:
            </div>
            <div className="flex justify-center space-x-4">
              <a href="/dashboard" className="text-blue-600 hover:underline text-sm">
                Tableau de bord
              </a>
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-green-600 hover:underline text-sm"
              >
                Continuer →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
