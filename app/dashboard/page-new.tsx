'use client';

import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const [userInfo, setUserInfo] = useState({
    name: '',
    role: '',
    email: ''
  });

  useEffect(() => {
    // Récupérer les infos depuis localStorage
    const name = localStorage.getItem('userName') || 'Utilisateur';
    const role = localStorage.getItem('userRole') || 'employee';
    const email = localStorage.getItem('userEmail') || '';
    
    setUserInfo({ name, role, email });
  }, []);

  const clearSetup = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('setupComplete');
    window.location.href = '/setup';
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Manager';
      case 'employee': return 'Employé';
      case 'intern': return 'Stagiaire';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard - Gestion des employés
            </h1>
            <button
              onClick={clearSetup}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Informations utilisateur */}
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Bienvenue, {userInfo.name}!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nom</dt>
                <dd className="mt-1 text-sm text-gray-900">{userInfo.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Rôle</dt>
                <dd className="mt-1 text-sm text-gray-900">{getRoleDisplayName(userInfo.role)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{userInfo.email}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par rôle */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Fonctionnalités générales */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Fonctionnalités générales
              </h3>
              <div className="space-y-2">
                <a 
                  href="/dashboard/tasks"
                  className="block px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
                >
                  📋 Mes tâches
                </a>
                <a 
                  href="/dashboard/calendar"
                  className="block px-3 py-2 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100"
                >
                  📅 Calendrier
                </a>
                <a 
                  href="/dashboard/chat"
                  className="block px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100"
                >
                  💬 Chat
                </a>
              </div>
            </div>
          </div>

          {/* Fonctionnalités par rôle */}
          {(userInfo.role === 'admin' || userInfo.role === 'manager') && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Gestion
                </h3>
                <div className="space-y-2">
                  <a 
                    href="/dashboard/employees"
                    className="block px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded hover:bg-yellow-100"
                  >
                    👥 Employés
                  </a>
                  <a 
                    href="/dashboard/projects"
                    className="block px-3 py-2 text-sm bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
                  >
                    🚀 Projets
                  </a>
                </div>
              </div>
            </div>
          )}

          {userInfo.role === 'admin' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Administration
                </h3>
                <div className="space-y-2">
                  <a 
                    href="/dashboard/admin"
                    className="block px-3 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100"
                  >
                    ⚙️ Paramètres système
                  </a>
                  <a 
                    href="/dashboard/settings"
                    className="block px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded hover:bg-gray-100"
                  >
                    🔧 Configuration
                  </a>
                </div>
              </div>
            </div>
          )}

          {userInfo.role === 'intern' && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Espace stagiaire
                </h3>
                <div className="space-y-2">
                  <a 
                    href="/dashboard/intern-portal"
                    className="block px-3 py-2 text-sm bg-pink-50 text-pink-700 rounded hover:bg-pink-100"
                  >
                    🎓 Portail stagiaire
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statut du système */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Système fonctionnel
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Le dashboard fonctionne correctement. Navigation activée et middleware désactivé.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
