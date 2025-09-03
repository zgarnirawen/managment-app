'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Star,
  User,
  Building,
  Award,
  Filter,
  Search,
  Download,
  Upload
} from 'lucide-react';

interface Intern {
  id: string;
  name: string;
  email: string;
  phone?: string;
  university: string;
  major: string;
  year: string;
  department: string;
  supervisor: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'on-leave' | 'terminated';
  performance: 'excellent' | 'good' | 'satisfactory' | 'needs-improvement';
  skills: string[];
  projects: string[];
  hoursWorked: number;
  totalHours: number;
  profileImage?: string;
  location: string;
  stipend?: number;
}

const InternsPage = () => {
  const { user } = useUser();
  const [interns, setInterns] = useState<Intern[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [universityFilter, setUniversityFilter] = useState('all');
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sample interns data
  useEffect(() => {
    const sampleInterns: Intern[] = [
      {
        id: '1',
        name: 'Emily Chen',
        email: 'emily.chen@university.edu',
        phone: '+1 (555) 123-4567',
        university: 'Stanford University',
        major: 'Computer Science',
        year: 'Junior',
        department: 'Engineering',
        supervisor: 'John Smith',
        startDate: '2024-01-15',
        endDate: '2024-05-15',
        status: 'active',
        performance: 'excellent',
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'SQL'],
        projects: ['Employee Management System', 'Analytics Dashboard'],
        hoursWorked: 280,
        totalHours: 400,
        location: 'San Francisco, CA',
        stipend: 2500
      },
      {
        id: '2',
        name: 'Marcus Johnson',
        email: 'marcus.j@college.edu',
        phone: '+1 (555) 987-6543',
        university: 'MIT',
        major: 'Data Science',
        year: 'Senior',
        department: 'Data Analytics',
        supervisor: 'Sarah Wilson',
        startDate: '2024-02-01',
        endDate: '2024-06-01',
        status: 'active',
        performance: 'good',
        skills: ['Python', 'Machine Learning', 'SQL', 'Tableau', 'R'],
        projects: ['Customer Analytics', 'Predictive Modeling'],
        hoursWorked: 240,
        totalHours: 320,
        location: 'Boston, MA',
        stipend: 3000
      },
      {
        id: '3',
        name: 'Sofia Rodriguez',
        email: 'sofia.r@university.edu',
        phone: '+1 (555) 456-7890',
        university: 'UC Berkeley',
        major: 'Business Administration',
        year: 'Sophomore',
        department: 'Marketing',
        supervisor: 'Mike Brown',
        startDate: '2023-09-01',
        endDate: '2023-12-15',
        status: 'completed',
        performance: 'excellent',
        skills: ['Marketing Strategy', 'Social Media', 'Analytics', 'Photoshop'],
        projects: ['Brand Campaign', 'Social Media Strategy'],
        hoursWorked: 320,
        totalHours: 320,
        location: 'Berkeley, CA',
        stipend: 2200
      },
      {
        id: '4',
        name: 'David Park',
        email: 'david.park@tech.edu',
        phone: '+1 (555) 321-0987',
        university: 'Carnegie Mellon',
        major: 'Cybersecurity',
        year: 'Graduate',
        department: 'IT Security',
        supervisor: 'Lisa Chen',
        startDate: '2024-01-08',
        endDate: '2024-04-08',
        status: 'on-leave',
        performance: 'good',
        skills: ['Network Security', 'Penetration Testing', 'Python', 'Linux'],
        projects: ['Security Audit', 'Vulnerability Assessment'],
        hoursWorked: 160,
        totalHours: 240,
        location: 'Pittsburgh, PA',
        stipend: 2800
      },
      {
        id: '5',
        name: 'Aisha Patel',
        email: 'aisha.patel@design.edu',
        university: 'RISD',
        major: 'UI/UX Design',
        year: 'Junior',
        department: 'Design',
        supervisor: 'Tom Wilson',
        startDate: '2024-02-15',
        endDate: '2024-06-15',
        status: 'active',
        performance: 'satisfactory',
        skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
        projects: ['Mobile App Redesign', 'Website UI Update'],
        hoursWorked: 200,
        totalHours: 320,
        location: 'Providence, RI',
        stipend: 2400
      }
    ];

    setTimeout(() => {
      setInterns(sampleInterns);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'completed':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'on-leave':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'terminated':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getPerformanceBadge = (performance: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (performance) {
      case 'excellent':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'good':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'satisfactory':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'needs-improvement':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const departments = [...new Set(interns.map(intern => intern.department))];
  const universities = [...new Set(interns.map(intern => intern.university))];

  const filteredInterns = interns.filter(intern => {
    const matchesSearch = intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         intern.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         intern.major.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || intern.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || intern.department === departmentFilter;
    const matchesUniversity = universityFilter === 'all' || intern.university === universityFilter;
    return matchesSearch && matchesStatus && matchesDepartment && matchesUniversity;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interns Management</h1>
            <p className="text-gray-600">Manage internship programs and student placements</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Intern</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Interns</p>
              <p className="text-2xl font-bold text-gray-900">{interns.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Interns</p>
              <p className="text-2xl font-bold text-gray-900">
                {interns.filter(i => i.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded">
              <Building className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {interns.filter(i => i.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col space-y-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search interns by name, university, or major..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on-leave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
            
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <select
              value={universityFilter}
              onChange={(e) => setUniversityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Universities</option>
              {universities.map(uni => (
                <option key={uni} value={uni}>{uni}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Interns Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intern
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  University & Major
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInterns.map((intern) => {
                const progressPercentage = (intern.hoursWorked / intern.totalHours) * 100;
                return (
                  <tr
                    key={intern.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedIntern(intern)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {intern.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{intern.name}</div>
                          <div className="text-sm text-gray-500">{intern.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{intern.university}</div>
                      <div className="text-sm text-gray-500">{intern.major} - {intern.year}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{intern.department}</div>
                      <div className="text-sm text-gray-500">Supervisor: {intern.supervisor}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(intern.startDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        to {new Date(intern.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 mb-1">
                        {intern.hoursWorked}/{intern.totalHours} hours
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(intern.status)}>
                        {intern.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getPerformanceBadge(intern.performance)}>
                        {intern.performance.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredInterns.length === 0 && (
        <div className="text-center py-8">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No interns found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all' || departmentFilter !== 'all' || universityFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding a new intern'}
          </p>
        </div>
      )}

      {/* Intern Detail Modal */}
      {selectedIntern && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{selectedIntern.name}</h2>
                <button
                  onClick={() => setSelectedIntern(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedIntern.email}</span>
                    </div>
                    {selectedIntern.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedIntern.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{selectedIntern.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <span>{selectedIntern.university}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Major:</span>
                      <span className="ml-2">{selectedIntern.major}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Year:</span>
                      <span className="ml-2">{selectedIntern.year}</span>
                    </div>
                    {selectedIntern.stipend && (
                      <div>
                        <span className="text-gray-600">Monthly Stipend:</span>
                        <span className="ml-2 text-green-600 font-semibold">
                          ${selectedIntern.stipend.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Internship Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600">Department:</span>
                      <span className="ml-2">{selectedIntern.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Supervisor:</span>
                      <span className="ml-2">{selectedIntern.supervisor}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="ml-2">
                        {new Date(selectedIntern.startDate).toLocaleDateString()} - {new Date(selectedIntern.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Hours Worked:</span>
                      <span className="ml-2">{selectedIntern.hoursWorked}/{selectedIntern.totalHours}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Status:</span>
                      <span className={getStatusBadge(selectedIntern.status)}>
                        {selectedIntern.status.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Performance:</span>
                      <span className={getPerformanceBadge(selectedIntern.performance)}>
                        {selectedIntern.performance.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedIntern.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Projects</h3>
                <div className="space-y-2">
                  {selectedIntern.projects.map((project, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>{project}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Intern Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Intern</h3>
            <p className="text-gray-600 mb-4">Intern registration form would go here...</p>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Add Intern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternsPage;
