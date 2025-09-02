'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import { Input } from '@/app/components/ui/input'
import { Textarea } from '@/app/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Progress } from '@/app/components/ui/progress'
import { useUser } from '@clerk/nextjs'
import { 
  BookOpen, 
  Clock, 
  Target, 
  Award, 
  Calendar,
  MessageSquare,
  FileText,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Play,
  Star,
  Bookmark,
  ArrowUp,
  User,
  Bell
} from 'lucide-react'

// Mock data for intern dashboard
const mockLearningModules = [
  {
    id: 1,
    title: 'Company Orientation',
    description: 'Learn about company culture, values, and policies',
    progress: 100,
    status: 'completed',
    duration: '2 hours',
    category: 'Onboarding'
  },
  {
    id: 2,
    title: 'Basic Excel Skills',
    description: 'Master fundamental Excel functions and formulas',
    progress: 75,
    status: 'in_progress',
    duration: '4 hours',
    category: 'Technical Skills'
  },
  {
    id: 3,
    title: 'Project Management Basics',
    description: 'Introduction to project planning and execution',
    progress: 0,
    status: 'not_started',
    duration: '3 hours',
    category: 'Business Skills'
  },
  {
    id: 4,
    title: 'Communication Skills',
    description: 'Effective workplace communication strategies',
    progress: 50,
    status: 'in_progress',
    duration: '2.5 hours',
    category: 'Soft Skills'
  },
  {
    id: 5,
    title: 'Data Analysis Fundamentals',
    description: 'Learn to analyze and interpret business data',
    progress: 0,
    status: 'locked',
    duration: '5 hours',
    category: 'Technical Skills'
  }
]

const mockAssignments = [
  {
    id: 1,
    title: 'Department Shadow Program',
    description: 'Shadow different departments to understand business operations',
    dueDate: '2024-12-25',
    priority: 'high',
    status: 'in_progress',
    mentor: 'Sarah Johnson',
    department: 'Operations'
  },
  {
    id: 2,
    title: 'Process Documentation',
    description: 'Document the customer onboarding process',
    dueDate: '2024-12-20',
    priority: 'medium',
    status: 'pending',
    mentor: 'Mike Chen',
    department: 'Sales'
  },
  {
    id: 3,
    title: 'Market Research Project',
    description: 'Research competitor analysis in our market segment',
    dueDate: '2024-12-30',
    priority: 'low',
    status: 'not_started',
    mentor: 'Emily Davis',
    department: 'Marketing'
  }
]

const mockMentorFeedback = [
  {
    id: 1,
    mentor: 'Sarah Johnson',
    date: '2024-12-15',
    rating: 4,
    feedback: 'Great progress on the orientation tasks. Shows good attention to detail and asks thoughtful questions.',
    category: 'Performance Review'
  },
  {
    id: 2,
    mentor: 'Mike Chen',
    date: '2024-12-12',
    rating: 5,
    feedback: 'Excellent communication skills. Takes initiative and collaborates well with team members.',
    category: 'Soft Skills'
  },
  {
    id: 3,
    mentor: 'Emily Davis',
    date: '2024-12-10',
    rating: 3,
    feedback: 'Good analytical thinking. Needs improvement in time management for project deadlines.',
    category: 'Technical Skills'
  }
]

const mockPerformanceMetrics = {
  completedModules: 1,
  totalModules: 5,
  averageScore: 85,
  hoursLogged: 120,
  targetHours: 160,
  assignmentsCompleted: 2,
  totalAssignments: 3,
  mentorRating: 4.0
}

const mockPromotionCriteria = {
  required: [
    { criteria: 'Complete all learning modules', completed: false, progress: 30 },
    { criteria: 'Finish all assigned projects', completed: false, progress: 66 },
    { criteria: 'Receive satisfactory mentor evaluations', completed: false, progress: 80 },
    { criteria: 'Log minimum 160 hours', completed: false, progress: 75 },
    { criteria: 'Pass final assessment', completed: false, progress: 0 }
  ],
  optional: [
    { criteria: 'Lead a team presentation', completed: false, progress: 0 },
    { criteria: 'Complete extra technical certification', completed: false, progress: 0 },
    { criteria: 'Contribute to process improvement', completed: true, progress: 100 }
  ]
}

interface PromotionRequestFormData {
  reason: string
  achievements: string
  goals: string
}

export default function InternDashboard() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('overview')
  const [learningModules] = useState(mockLearningModules)
  const [assignments] = useState(mockAssignments)
  const [feedback] = useState(mockMentorFeedback)
  const [metrics] = useState(mockPerformanceMetrics)
  const [promotionCriteria] = useState(mockPromotionCriteria)
  const [showPromotionForm, setShowPromotionForm] = useState(false)
  const [promotionForm, setPromotionForm] = useState<PromotionRequestFormData>({
    reason: '',
    achievements: '',
    goals: ''
  })

  const overallProgress = () => {
    const completed = promotionCriteria.required.filter(c => c.completed).length
    return (completed / promotionCriteria.required.length) * 100
  }

  const canRequestPromotion = () => {
    return promotionCriteria.required.filter(c => c.completed).length >= 3
  }

  const handlePromotionSubmit = () => {
    // Submit to placeholder API
    fetch('/api/placeholder/promotion-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promotionForm)
    })
      .then(res => res.json())
      .then((data) => {
        console.log('Promotion request response:', data)
        setShowPromotionForm(false)
        setPromotionForm({ reason: '', achievements: '', goals: '' })
        alert(data?.message || 'Promotion request submitted (placeholder)')
      })
      .catch((err) => {
        console.error(err)
        alert('Failed to submit promotion request (placeholder)')
      })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Intern Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.firstName || 'Intern'}! Continue your learning journey.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <User className="h-4 w-4 mr-1" />
                Intern Level
              </Badge>
              <Button 
                onClick={() => setShowPromotionForm(true)}
                disabled={!canRequestPromotion()}
                className="bg-green-600 hover:bg-green-700"
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Request Promotion
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Learning Progress</p>
                  <p className="text-2xl font-bold">{metrics.completedModules}/{metrics.totalModules}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <Progress value={(metrics.completedModules / metrics.totalModules) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hours Logged</p>
                  <p className="text-2xl font-bold">{metrics.hoursLogged}/{metrics.targetHours}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <Progress value={(metrics.hoursLogged / metrics.targetHours) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assignments</p>
                  <p className="text-2xl font-bold">{metrics.assignmentsCompleted}/{metrics.totalAssignments}</p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <Progress value={(metrics.assignmentsCompleted / metrics.totalAssignments) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mentor Rating</p>
                  <p className="text-2xl font-bold">{metrics.mentorRating}/5.0</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="flex mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= metrics.mentorRating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="promotion">Promotion</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Completed Company Orientation</p>
                        <p className="text-sm text-gray-600">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Play className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Started Excel Skills Module</p>
                        <p className="text-sm text-gray-600">Yesterday</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Received mentor feedback</p>
                        <p className="text-sm text-gray-600">2 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignments.filter(a => a.status !== 'completed').slice(0, 3).map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-gray-600">Due: {assignment.dueDate}</p>
                        </div>
                        <Badge
                          variant={assignment.priority === 'high' ? 'destructive' : 
                                  assignment.priority === 'medium' ? 'default' : 'secondary'}
                        >
                          {assignment.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Learning Modules</CardTitle>
                <CardDescription>Complete these modules to advance your skills and knowledge</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {learningModules.map((module) => (
                    <Card key={module.id} className={module.status === 'locked' ? 'opacity-50' : ''}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline">{module.category}</Badge>
                          <Badge
                            variant={module.status === 'completed' ? 'default' :
                                   module.status === 'in_progress' ? 'secondary' :
                                   module.status === 'locked' ? 'destructive' : 'outline'}
                          >
                            {module.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h3 className="font-semibold mb-2">{module.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} />
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-sm text-gray-500">{module.duration}</span>
                            <Button 
                              size="sm" 
                              disabled={module.status === 'locked'}
                              variant={module.status === 'completed' ? 'outline' : 'default'}
                            >
                              {module.status === 'completed' ? 'Review' : 
                               module.status === 'in_progress' ? 'Continue' : 
                               module.status === 'locked' ? 'Locked' : 'Start'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Assignments</CardTitle>
                <CardDescription>Your assigned projects and tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <Badge
                              variant={assignment.priority === 'high' ? 'destructive' : 
                                      assignment.priority === 'medium' ? 'default' : 'secondary'}
                            >
                              {assignment.priority} priority
                            </Badge>
                            <Badge variant="outline">{assignment.department}</Badge>
                          </div>
                          <Badge
                            variant={assignment.status === 'completed' ? 'default' :
                                   assignment.status === 'in_progress' ? 'secondary' : 'outline'}
                          >
                            {assignment.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{assignment.title}</h3>
                        <p className="text-gray-600 mb-4">{assignment.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Mentor: {assignment.mentor}</span>
                            <span>Due: {assignment.dueDate}</span>
                          </div>
                          <Button size="sm">
                            {assignment.status === 'completed' ? 'View Details' : 'Work on Task'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mentor Feedback</CardTitle>
                <CardDescription>Reviews and guidance from your mentors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {feedback.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{review.mentor}</h3>
                            <p className="text-sm text-gray-500">{review.date}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{review.category}</Badge>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.feedback}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promotion Tab */}
          <TabsContent value="promotion" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Promotion to Employee</CardTitle>
                  <CardDescription>Track your progress toward promotion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Overall Progress</span>
                        <span>{Math.round(overallProgress())}%</span>
                      </div>
                      <Progress value={overallProgress()} className="mb-4" />
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Required Criteria</h4>
                      <div className="space-y-3">
                        {promotionCriteria.required.map((criteria, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              {criteria.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                              )}
                              <span className={criteria.completed ? 'line-through text-gray-500' : ''}>
                                {criteria.criteria}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">{criteria.progress}%</div>
                              <Progress value={criteria.progress} className="w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Optional Criteria (Bonus)</h4>
                      <div className="space-y-3">
                        {promotionCriteria.optional.map((criteria, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                            <div className="flex items-center space-x-3">
                              {criteria.completed ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <Bookmark className="h-5 w-5 text-blue-600" />
                              )}
                              <span className={criteria.completed ? 'line-through text-gray-500' : ''}>
                                {criteria.criteria}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">{criteria.progress}%</div>
                              <Progress value={criteria.progress} className="w-16" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Promotion Request</CardTitle>
                  <CardDescription>
                    {canRequestPromotion() 
                      ? 'You meet the minimum requirements. Submit your promotion request!'
                      : 'Complete more requirements to unlock promotion request.'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {canRequestPromotion() ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-medium text-green-800">Ready for Promotion!</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                          You've completed {promotionCriteria.required.filter(c => c.completed).length} out of {promotionCriteria.required.length} required criteria.
                        </p>
                      </div>
                      <Button 
                        onClick={() => setShowPromotionForm(true)}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <ArrowUp className="h-4 w-4 mr-2" />
                        Submit Promotion Request
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="font-medium text-yellow-800">Requirements Not Met</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Complete at least 3 required criteria to submit a promotion request.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>This Week's Schedule</CardTitle>
                <CardDescription>Your learning schedule and appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Mock schedule items */}
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium">Monday, Dec 16</div>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <div>9:00 AM - Team Standup</div>
                      <div>10:30 AM - Excel Training</div>
                      <div>2:00 PM - Mentor Meeting</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium">Tuesday, Dec 17</div>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <div>9:00 AM - Department Shadow</div>
                      <div>1:00 PM - Project Work</div>
                      <div>3:30 PM - Skills Assessment</div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="font-medium">Wednesday, Dec 18</div>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <div>9:00 AM - Learning Module</div>
                      <div>11:00 AM - Team Meeting</div>
                      <div>2:00 PM - Assignment Review</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Promotion Request Modal */}
        {showPromotionForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Promotion Request Form</CardTitle>
                <CardDescription>Submit your request for promotion to Employee level</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Why do you believe you're ready for promotion?
                  </label>
                  <Textarea
                    value={promotionForm.reason}
                    onChange={(e) => setPromotionForm({...promotionForm, reason: e.target.value})}
                    placeholder="Explain your readiness for the next level..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Key achievements during your internship
                  </label>
                  <Textarea
                    value={promotionForm.achievements}
                    onChange={(e) => setPromotionForm({...promotionForm, achievements: e.target.value})}
                    placeholder="List your major accomplishments..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Career goals as an Employee
                  </label>
                  <Textarea
                    value={promotionForm.goals}
                    onChange={(e) => setPromotionForm({...promotionForm, goals: e.target.value})}
                    placeholder="Describe your goals and aspirations..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPromotionForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handlePromotionSubmit}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Submit Request
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
