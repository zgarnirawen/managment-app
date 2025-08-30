'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '../components/ui/button';
import LoadingSpinner from '../components/LoadingSpinner';

interface Policy {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  effectiveDate: string;
  expiryDate?: string;
  approvedBy?: string;
  tags: string[];
}

export default function PoliciesPage() {
  const { user, isLoaded } = useUser();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Check if user is admin
  const userRole = user?.unsafeMetadata?.role as string || 
                   user?.publicMetadata?.role as string;
  const isAdmin = userRole?.toLowerCase() === 'admin';

  useEffect(() => {
    if (isLoaded && isAdmin) {
      fetchPolicies();
    }
  }, [isLoaded, isAdmin]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/policies');
      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies || []);
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPolicy = async (policyData: Partial<Policy>) => {
    try {
      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policyData)
      });
      
      if (response.ok) {
        fetchPolicies();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating policy:', error);
    }
  };

  const updatePolicyStatus = async (policyId: string, status: Policy['status']) => {
    try {
      const response = await fetch(`/api/policies/${policyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        fetchPolicies();
      }
    } catch (error) {
      console.error('Error updating policy:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20';
      case 'draft': return 'text-yellow-400 bg-yellow-400/20';
      case 'archived': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hr': return '👥';
      case 'security': return '🔒';
      case 'compliance': return '⚖️';
      case 'it': return '💻';
      case 'finance': return '💰';
      case 'general': return '📋';
      default: return '📄';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredPolicies = policies.filter(policy => {
    const matchesCategory = selectedCategory === 'all' || policy.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = [...new Set(policies.map(p => p.category))];

  if (!isLoaded) return <LoadingSpinner />;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-nextgen-dark-gray text-nextgen-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-nextgen-light-gray">Only administrators can manage organizational policies.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nextgen-dark-gray text-nextgen-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-nextgen-teal mb-2">
            📋 Organizational Policies
          </h1>
          <p className="text-nextgen-light-gray">
            Manage company policies, procedures, and compliance documents
          </p>
        </div>

        {/* Controls */}
        <div className="bg-nextgen-medium-gray rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1">
              <div>
                <label className="block text-nextgen-light-gray mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-nextgen-dark-blue border border-nextgen-light-gray rounded px-3 py-2"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-nextgen-light-gray mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-nextgen-dark-blue border border-nextgen-light-gray rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-nextgen-teal hover:bg-nextgen-teal-hover"
              >
                ➕ Create Policy
              </Button>
              <Button variant="outline">
                📥 Import Policies
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-nextgen-medium-gray rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">
              {policies.filter(p => p.status === 'active').length}
            </div>
            <div className="text-nextgen-light-gray">Active Policies</div>
          </div>
          <div className="bg-nextgen-medium-gray rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-400">
              {policies.filter(p => p.status === 'draft').length}
            </div>
            <div className="text-nextgen-light-gray">Draft Policies</div>
          </div>
          <div className="bg-nextgen-medium-gray rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-400">
              {policies.filter(p => p.status === 'archived').length}
            </div>
            <div className="text-nextgen-light-gray">Archived</div>
          </div>
          <div className="bg-nextgen-medium-gray rounded-lg p-4">
            <div className="text-2xl font-bold text-nextgen-teal">
              {categories.length}
            </div>
            <div className="text-nextgen-light-gray">Categories</div>
          </div>
        </div>

        {/* Policies Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPolicies.length === 0 ? (
              <div className="col-span-full text-center py-12 text-nextgen-light-gray">
                No policies found matching your criteria
              </div>
            ) : (
              filteredPolicies.map((policy) => (
                <div key={policy.id} className="bg-nextgen-medium-gray rounded-lg p-6 hover:bg-nextgen-dark-blue/30 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(policy.category)}</span>
                      <span className="text-nextgen-light-gray text-sm">{policy.category}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(policy.status)}`}>
                      {policy.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-nextgen-white mb-2">
                    {policy.title}
                  </h3>
                  
                  <p className="text-nextgen-light-gray text-sm mb-4 line-clamp-3">
                    {policy.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-nextgen-light-gray">Version:</span>
                      <span className="text-nextgen-white">{policy.version}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-nextgen-light-gray">Effective:</span>
                      <span className="text-nextgen-white">{formatDate(policy.effectiveDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-nextgen-light-gray">Updated:</span>
                      <span className="text-nextgen-white">{formatDate(policy.updatedAt)}</span>
                    </div>
                  </div>
                  
                  {policy.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {policy.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-nextgen-dark-blue rounded text-xs text-nextgen-light-gray">
                            {tag}
                          </span>
                        ))}
                        {policy.tags.length > 3 && (
                          <span className="px-2 py-1 bg-nextgen-dark-blue rounded text-xs text-nextgen-light-gray">
                            +{policy.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      📖 View
                    </Button>
                    <Button size="sm" variant="outline">
                      ✏️ Edit
                    </Button>
                    {policy.status === 'draft' && (
                      <Button 
                        size="sm" 
                        onClick={() => updatePolicyStatus(policy.id, 'active')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        ✅ Activate
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4">
          <Button className="bg-nextgen-teal hover:bg-nextgen-teal-hover">
            📊 Policy Analytics
          </Button>
          <Button variant="outline">
            📤 Export All Policies
          </Button>
          <Button variant="outline">
            🔔 Send Policy Updates
          </Button>
          <Button variant="outline">
            📋 Compliance Report
          </Button>
        </div>
      </div>
    </div>
  );
}
