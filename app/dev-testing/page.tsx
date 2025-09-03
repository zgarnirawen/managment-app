'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  TestTube,
  Bug,
  Code,
  Database,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  Play,
  Settings
} from 'lucide-react';

export default function DevTestingPage() {
  const { user } = useUser();
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});

  const testCategories = [
    {
      id: 'auth',
      title: 'Authentication Tests',
      description: 'Test user authentication, role management, and security features',
      icon: Shield,
      tests: ['Login Flow', 'Role Permissions', 'Session Management', 'Password Reset']
    },
    {
      id: 'api',
      title: 'API Integration Tests',
      description: 'Test API endpoints, data fetching, and error handling',
      icon: Code,
      tests: ['CRUD Operations', 'Data Validation', 'Error Responses', 'Rate Limiting']
    },
    {
      id: 'database',
      title: 'Database Tests',
      description: 'Test database connections, queries, and data integrity',
      icon: Database,
      tests: ['Connection Status', 'Query Performance', 'Data Migration', 'Backup/Restore']
    },
    {
      id: 'ui',
      title: 'UI/UX Tests',
      description: 'Test user interface components and user experience',
      icon: TestTube,
      tests: ['Component Rendering', 'Responsive Design', 'Accessibility', 'Performance']
    },
    {
      id: 'performance',
      title: 'Performance Tests',
      description: 'Test application performance and optimization',
      icon: Zap,
      tests: ['Load Times', 'Memory Usage', 'Bundle Size', 'Caching']
    }
  ];

  const runTest = async (testId: string) => {
    setActiveTest(testId);
    // Simulate test execution
    setTimeout(() => {
      setTestResults(prev => ({
        ...prev,
        [testId]: Math.random() > 0.3 // 70% success rate for demo
      }));
      setActiveTest(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nextgen-dark-blue to-nextgen-medium-gray p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <TestTube className="w-8 h-8 text-nextgen-teal" />
            Development Testing Suite
          </h1>
          <p className="text-nextgen-light-gray">
            Test and validate application features, APIs, and performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {testCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.id} className="bg-white/10 border-nextgen-teal/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-white">
                    <Icon className="w-6 h-6 text-nextgen-teal" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-nextgen-light-gray mb-4 text-sm">
                    {category.description}
                  </p>
                  <div className="space-y-2">
                    {category.tests.map((test) => (
                      <div key={test} className="flex items-center justify-between">
                        <span className="text-sm text-white">{test}</span>
                        <div className="flex items-center gap-2">
                          {testResults[`${category.id}-${test}`] !== undefined && (
                            <Badge
                              variant={testResults[`${category.id}-${test}`] ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {testResults[`${category.id}-${test}`] ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <AlertCircle className="w-3 h-3 mr-1" />
                              )}
                              {testResults[`${category.id}-${test}`] ? 'Pass' : 'Fail'}
                            </Badge>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => runTest(`${category.id}-${test}`)}
                            disabled={activeTest === `${category.id}-${test}`}
                            className="text-xs"
                          >
                            {activeTest === `${category.id}-${test}` ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-nextgen-teal"></div>
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-white/10 border-nextgen-teal/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Settings className="w-6 h-6 text-nextgen-teal" />
              Testing Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-nextgen-teal mb-1">
                  {Object.keys(testResults).length}
                </div>
                <div className="text-sm text-nextgen-light-gray">Tests Run</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {Object.values(testResults).filter(Boolean).length}
                </div>
                <div className="text-sm text-nextgen-light-gray">Tests Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {Object.values(testResults).filter(result => !result).length}
                </div>
                <div className="text-sm text-nextgen-light-gray">Tests Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
