'use client';

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  MessageCircle, 
  Paperclip, 
  Eye, 
  Tag, 
  FolderOpen, 
  Users, 
  Calendar,
  FileText,
  Send,
  Bell,
  CheckCircle,
  Clock,
  ArrowLeft,
  MessageSquare,
  Heart,
  Star,
  Play,
  Pause
} from 'lucide-react';
import Link from 'next/link';
import ChatSystem from '../components/chat/ChatSystem';

export default function CollaborationPage() {
  const [currentEmployee, setCurrentEmployee] = useState({
    id: '',
    name: '',
    email: ''
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'comment',
      message: 'Nouveau commentaire sur la tâche "Authentification"',
      time: '5 min',
      read: false
    },
    {
      id: '2',
      type: 'leave',
      message: 'Votre demande de congé a été approuvée',
      time: '1h',
      read: false
    },
    {
      id: '3',
      type: 'task',
      message: 'Nouvelle tâche assignée: "Interface utilisateur"',
      time: '2h',
      read: true
    }
  ]);

  useEffect(() => {
    // Get user info from localStorage
    const id = localStorage.getItem('userId') || 'user_default';
    const name = localStorage.getItem('userName') || 'Utilisateur';
    const email = localStorage.getItem('userEmail') || 'user@company.com';
    
    setCurrentEmployee({ id, name, email });
  }, []);

  const features = [
    {
      title: 'Chat en Temps Réel',
      description: 'Messagerie instantanée avec indicateurs de frappe et statuts en ligne',
      icon: MessageCircle,
      status: 'active',
      color: 'bg-blue-500',
      demo: 'chat'
    },
    {
      title: 'Gestion des Congés',
      description: 'Système complet de demandes et approbations de congés',
      icon: Calendar,
      status: 'active',
      color: 'bg-green-500',
      demo: 'leave'
    },
    {
      title: 'Commentaires & Mentions',
      description: 'Système de commentaires avec mentions @utilisateur',
      icon: MessageSquare,
      status: 'development',
      color: 'bg-purple-500',
      demo: 'comments'
    },
    {
      title: 'Pièces Jointes',
      description: 'Upload et partage de fichiers avec prévisualisation',
      icon: Paperclip,
      status: 'planned',
      color: 'bg-orange-500',
      demo: 'attachments'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">✅ Actif</Badge>;
      case 'development':
        return <Badge className="bg-yellow-100 text-yellow-800">🚧 En développement</Badge>;
      case 'planned':
        return <Badge className="bg-gray-100 text-gray-800">📋 Planifié</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Phase 4: Collaboration & Congés</h1>
                  <p className="text-gray-600">Outils de communication et gestion des absences</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                {features.filter(f => f.status === 'active').length}/4 Fonctionnalités Actives
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat en Direct
            </TabsTrigger>
            <TabsTrigger value="leave" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Gestion Congés
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Fonctionnalités
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Progress Overview */}
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Progression Phase 4
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="text-center">
                      <feature.icon className="h-8 w-8 mx-auto mb-2 opacity-90" />
                      <h4 className="font-medium text-sm">{feature.title}</h4>
                      <div className="mt-2">
                        {feature.status === 'active' ? (
                          <div className="w-2 h-2 bg-green-400 rounded-full mx-auto"></div>
                        ) : feature.status === 'development' ? (
                          <div className="w-2 h-2 bg-yellow-400 rounded-full mx-auto animate-pulse"></div>
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full mx-auto"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-white/20">
                  <div className="flex justify-between text-sm">
                    <span>Progression globale</span>
                    <span>50% complété</span>
                  </div>
                  <div className="mt-2 bg-white/20 rounded-full h-2">
                    <div className="bg-white rounded-full h-2 w-1/2 transition-all duration-500"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border-l-4" style={{ borderLeftColor: feature.color.replace('bg-', '#') }}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center`}>
                          <feature.icon className="h-5 w-5 text-white" />
                        </div>
                        {feature.title}
                      </CardTitle>
                      {getStatusBadge(feature.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {feature.status === 'active' && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Play className="h-4 w-4" />
                            <span className="text-sm">Disponible</span>
                          </div>
                        )}
                        {feature.status === 'development' && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">En cours</span>
                          </div>
                        )}
                        {feature.status === 'planned' && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <Pause className="h-4 w-4" />
                            <span className="text-sm">Planifié</span>
                          </div>
                        )}
                      </div>
                      
                      {feature.status === 'active' && (
                        <Button 
                          size="sm" 
                          onClick={() => setActiveTab(feature.demo)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600"
                        >
                          Try Feature
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Activité Récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${notification.read ? 'bg-gray-400' : 'bg-blue-500'}`}></div>
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Alert>
              <MessageCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Chat en Temps Réel</strong> - Système de messagerie instantanée avec Socket.io
              </AlertDescription>
            </Alert>
            
            {currentEmployee.id ? (
              <div className="bg-white rounded-lg border h-[600px]">
                <ChatSystem
                  currentEmployeeId={currentEmployee.id}
                  currentEmployeeName={currentEmployee.name}
                  currentEmployeeEmail={currentEmployee.email}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="animate-pulse">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p>Chargement du chat...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="leave" className="space-y-6">
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                <strong>Gestion des Congés</strong> - Système complet de demandes et approbations
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Accès aux Congés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Gérez vos demandes de congés, consultez l'historique et suivez les approbations.
                  </p>
                  
                  <Link href="/dashboard/leave">
                    <Button className="w-full bg-gradient-to-r from-green-500 to-blue-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Accéder à la Gestion des Congés
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Statistiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">5</div>
                      <div className="text-xs text-gray-600">Jours restants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">2</div>
                      <div className="text-xs text-gray-600">Demandes approuvées</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">1</div>
                      <div className="text-xs text-gray-600">En attente</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Alert>
              <Star className="h-4 w-4" />
              <AlertDescription>
                <strong>Toutes les Fonctionnalités</strong> - Vue détaillée de tous les outils de collaboration
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                        {getStatusBadge(feature.status)}
                      </div>
                      
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      
                      <div className="flex items-center gap-4">
                        {feature.status === 'active' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => setActiveTab(feature.demo)}
                              className="bg-gradient-to-r from-blue-500 to-purple-600"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Utiliser
                            </Button>
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">Prêt à l'utilisation</span>
                            </div>
                          </>
                        )}
                        
                        {feature.status === 'development' && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">En développement actif</span>
                          </div>
                        )}
                        
                        {feature.status === 'planned' && (
                          <div className="flex items-center gap-1 text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">Dans la roadmap</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            
            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle>Technologies Utilisées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Frontend</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Next.js 15.5.0 avec React</li>
                      <li>• Socket.io Client pour temps réel</li>
                      <li>• Tailwind CSS + Shadcn/UI</li>
                      <li>• TypeScript pour la sécurité</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Backend</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Prisma ORM + PostgreSQL</li>
                      <li>• Socket.io Server</li>
                      <li>• API Routes Next.js</li>
                      <li>• Système d'authentification</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
