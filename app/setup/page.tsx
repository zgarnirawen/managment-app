'use client';

import { useState } from 'react';

export default function SetupPage() {
  const [formData, setFormData] = useState({
    role: '',
    name: '',
    email: ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.role || !formData.name || !formData.email) {
      setMessage('Veuillez remplir tous les champs');
      return;
    }

    try {
      setMessage('Configuration en cours...');

      // Sauvegarder dans localStorage
      localStorage.setItem('userRole', formData.role);
      localStorage.setItem('userName', formData.name);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('setupComplete', 'true');

      setMessage('Configuration terminée! Redirection...');
      
      // Attendre un peu plus avant la redirection et vérifier que la page existe
      setTimeout(() => {
        try {
          window.location.href = '/dashboard';
        } catch (error) {
          setMessage('Erreur lors de la redirection. Cliquez sur le lien ci-dessous.');
        }
      }, 2000);
    } catch (error) {
      setMessage('Erreur lors de la configuration. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow text-gray-900">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Configuration initiale</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border rounded-md text-gray-900 bg-white"
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-2 border rounded-md text-gray-900 bg-white"
              placeholder="votre.email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">Rôle</label>
            <div className="space-y-2">
              {[
                { value: 'admin', label: 'Administrateur' },
                { value: 'manager', label: 'Manager' },
                { value: 'employee', label: 'Employé' },
                { value: 'intern', label: 'Stagiaire' }
              ].map((role) => (
                <label key={role.value} className="flex items-center text-gray-700">
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="mr-2"
                  />
                  {role.label}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Terminer la configuration
          </button>

          {message && (
            <div className={`text-center text-sm ${message.includes('terminée') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}
        </form>

        {/* Quick access links */}
        <div className="mt-6 pt-4 border-t text-center space-y-2">
          <div>
            <a href="/dashboard" className="text-blue-600 hover:underline">
              Go to Dashboard
            </a>
          </div>
          <div>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="text-green-600 hover:underline"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
