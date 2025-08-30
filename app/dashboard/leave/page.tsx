'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Hourglass, 
  Plus,
  User,
  FileText,
  Filter,
  ArrowLeft
} from 'lucide-react';

interface LeaveRequest {
  id: string;
  type: 'VACATION' | 'SICK' | 'PERSONAL' | 'MATERNITY' | 'EMERGENCY';
  startDate: string;
  endDate: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  employee: {
    id: string;
    name: string;
    email: string;
  };
  approvedBy?: {
    id: string;
    name: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
}

export default function LeavePage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  useEffect(() => {
    // Get user info from localStorage
    const role = localStorage.getItem('userRole') || 'employee';
    const name = localStorage.getItem('userName') || 'Utilisateur';
    const email = localStorage.getItem('userEmail') || '';
    setUserRole(role);
    setUserName(name);
    setUserEmail(email);

    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/leave-requests');
      if (!response.ok) throw new Error('Failed to fetch leave requests');
      
      const data = await response.json();
      setLeaveRequests(data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Hourglass className="h-3 w-3" />
            En attente
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Approuvé
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejeté
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'VACATION': return '🏖️ Vacances';
      case 'SICK': return '🤒 Maladie';
      case 'PERSONAL': return '👤 Personnel';
      case 'MATERNITY': return '👶 Maternité';
      case 'EMERGENCY': return '🚨 Urgence';
      default: return type;
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getFilteredRequests = () => {
    if (filter === 'ALL') return leaveRequests;
    return leaveRequests.filter(request => request.status === filter);
  };

  const getStats = () => {
    const total = leaveRequests.length;
    const pending = leaveRequests.filter(r => r.status === 'PENDING').length;
    const approved = leaveRequests.filter(r => r.status === 'APPROVED').length;
    const rejected = leaveRequests.filter(r => r.status === 'REJECTED').length;
    
    const totalDaysRequested = leaveRequests.reduce((sum, request) => {
      return sum + calculateDays(request.startDate, request.endDate);
    }, 0);

    const approvedDays = leaveRequests
      .filter(r => r.status === 'APPROVED')
      .reduce((sum, request) => {
        return sum + calculateDays(request.startDate, request.endDate);
      }, 0);

    return { total, pending, approved, rejected, totalDaysRequested, approvedDays };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Congés</h1>
            <p className="text-gray-600 mt-1">
              Bonjour {userName}, gérez vos demandes de congés
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm">
            {userRole === 'admin' ? 'Administrateur' : 
             userRole === 'manager' ? 'Manager' : 
             userRole === 'employee' ? 'Employé' : 'Stagiaire'}
          </Badge>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle Demande
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Nouvelle demande de congé</DialogTitle>
              </DialogHeader>
              <CreateLeaveForm 
                userEmail={userEmail}
                onSuccess={() => {
                  setShowCreateModal(false);
                  fetchLeaveRequests();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Demandes</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Hourglass className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approuvées</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejetées</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jours demandés</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalDaysRequested}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jours approuvés</p>
                <p className="text-2xl font-bold text-purple-600">{stats.approvedDays}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtrer les demandes
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className="flex items-center gap-2"
                >
                  {status === 'ALL' && <FileText className="h-4 w-4" />}
                  {status === 'PENDING' && <Hourglass className="h-4 w-4" />}
                  {status === 'APPROVED' && <CheckCircle className="h-4 w-4" />}
                  {status === 'REJECTED' && <XCircle className="h-4 w-4" />}
                  {status === 'ALL' ? 'Toutes' : 
                   status === 'PENDING' ? 'En attente' :
                   status === 'APPROVED' ? 'Approuvées' : 'Rejetées'}
                </Button>
              ))}
            </div>
            <div className="text-sm text-gray-600">
              {getFilteredRequests().length} demande(s) affichée(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests List */}
      <div className="grid grid-cols-1 gap-4">
        {getFilteredRequests().length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune demande de congé
              </h3>
              <p className="text-gray-600 mb-4">
                {filter === 'ALL' 
                  ? "Vous n'avez encore aucune demande de congé." 
                  : `Aucune demande ${filter === 'PENDING' ? 'en attente' : 
                      filter === 'APPROVED' ? 'approuvée' : 'rejetée'}.`}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                Créer une demande
              </Button>
            </CardContent>
          </Card>
        ) : (
          getFilteredRequests().map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getLeaveTypeLabel(request.type).split(' ')[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {getLeaveTypeLabel(request.type).substring(2)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Du {new Date(request.startDate).toLocaleDateString('fr-FR')} au{' '}
                        {new Date(request.endDate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      {calculateDays(request.startDate, request.endDate)} jour(s)
                    </Badge>
                    {getStatusBadge(request.status)}
                  </div>
                </div>

                {request.reason && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Motif</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {request.reason}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Demandé par</h4>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{request.employee.name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Date de demande</h4>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  {request.approvedBy && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">
                        {request.status === 'APPROVED' ? 'Approuvé par' : 'Traité par'}
                      </h4>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{request.approvedBy.name}</span>
                      </div>
                    </div>
                  )}
                </div>

                {request.rejectionReason && (
                  <div className="mt-4">
                    <Alert className="border-red-200 bg-red-50">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Motif du rejet :</strong> {request.rejectionReason}
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {userRole === 'manager' || userRole === 'admin' ? (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-2">
                      {request.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprovalAction(request.id, 'APPROVED')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleApprovalAction(request.id, 'REJECTED')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeter
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  async function handleApprovalAction(requestId: string, action: 'APPROVED' | 'REJECTED') {
    // TODO: Implement approval/rejection logic
    console.log(`${action} request ${requestId}`);
  }
}

// Component for creating new leave requests
function CreateLeaveForm({ userEmail, onSuccess }: { userEmail: string; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    type: 'VACATION',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      setError('Les dates de début et fin sont requises');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('La date de fin doit être après la date de début');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création');
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating leave request:', error);
      setError(error instanceof Error ? error.message : 'Erreur lors de la création');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="type">Type de congé *</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="VACATION">🏖️ Vacances</SelectItem>
            <SelectItem value="SICK">🤒 Maladie</SelectItem>
            <SelectItem value="PERSONAL">👤 Personnel</SelectItem>
            <SelectItem value="MATERNITY">👶 Maternité</SelectItem>
            <SelectItem value="EMERGENCY">🚨 Urgence</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Date de début *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">Date de fin *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="reason">Motif (optionnel)</Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Expliquez brièvement le motif de votre demande..."
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Création...' : 'Créer la demande'}
      </Button>
    </form>
  );
}
