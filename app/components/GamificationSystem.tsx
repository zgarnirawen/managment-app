'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
  Clock,
  Users,
  CheckCircle,
  Calendar,
  Zap
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  category: 'productivity' | 'collaboration' | 'leadership' | 'learning' | 'special';
}

interface UserStats {
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  currentLevelPoints: number;
  tasksCompleted: number;
  projectsFinished: number;
  hoursWorked: number;
  teamCollaborations: number;
  streak: number;
}

export default function GamificationSystem() {
  const { user } = useUser();
  const [stats, setStats] = useState<UserStats>({
    totalPoints: 1250,
    level: 8,
    nextLevelPoints: 1500,
    currentLevelPoints: 1000,
    tasksCompleted: 47,
    projectsFinished: 8,
    hoursWorked: 156,
    teamCollaborations: 23,
    streak: 7
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-task',
      title: 'First Steps',
      description: 'Complete your first task',
      icon: '🎯',
      points: 50,
      unlocked: true,
      category: 'productivity'
    },
    {
      id: 'week-streak',
      title: 'Week Warrior',
      description: 'Complete tasks for 7 consecutive days',
      icon: '🔥',
      points: 200,
      unlocked: true,
      category: 'productivity'
    },
    {
      id: 'team-player',
      title: 'Team Player',
      description: 'Collaborate on 10 projects',
      icon: '🤝',
      points: 150,
      unlocked: true,
      category: 'collaboration'
    },
    {
      id: 'promotion-master',
      title: 'Promotion Master',
      description: 'Get promoted to the next role',
      icon: '📈',
      points: 500,
      unlocked: false,
      category: 'leadership'
    },
    {
      id: 'mentor',
      title: 'Mentor',
      description: 'Help train a new team member',
      icon: '👨‍🏫',
      points: 300,
      unlocked: false,
      category: 'leadership'
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Clock in before 8 AM for 5 days',
      icon: '🌅',
      points: 100,
      unlocked: false,
      category: 'productivity'
    }
  ]);

  const [activeTab, setActiveTab] = useState('overview');

  const userRole = user?.unsafeMetadata?.role as string;

  const getLevelColor = (level: number) => {
    if (level < 5) return 'from-green-400 to-green-600';
    if (level < 10) return 'from-blue-400 to-blue-600';
    if (level < 15) return 'from-purple-400 to-purple-600';
    if (level < 20) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'productivity': return 'bg-green-100 text-green-800 border-green-200';
      case 'collaboration': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'leadership': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'learning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'special': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const progressPercentage = ((stats.totalPoints - stats.currentLevelPoints) / (stats.nextLevelPoints - stats.currentLevelPoints)) * 100;

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Level and Progress */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getLevelColor(stats.level)} flex items-center justify-center`}>
              <span className="text-white font-bold text-lg">{stats.level}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Level {stats.level}</h3>
              <p className="text-sm text-gray-600">{stats.totalPoints} Total Points</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Next Level</p>
            <p className="text-lg font-semibold text-gray-900">{stats.nextLevelPoints - stats.totalPoints} points to go</p>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full bg-gradient-to-r ${getLevelColor(stats.level)} transition-all duration-300`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>Level {stats.level}</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
          <span>Level {stats.level + 1}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              { id: 'leaderboard', label: 'Leaderboard', icon: Award }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Tasks Completed"
                  value={stats.tasksCompleted}
                  subtitle="This month"
                  icon={CheckCircle}
                  color="bg-green-500"
                />
                <StatCard
                  title="Projects Finished"
                  value={stats.projectsFinished}
                  subtitle="This quarter"
                  icon={Target}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Hours Worked"
                  value={stats.hoursWorked}
                  subtitle="This month"
                  icon={Clock}
                  color="bg-purple-500"
                />
                <StatCard
                  title="Current Streak"
                  value={`${stats.streak} days`}
                  subtitle="Daily activity"
                  icon={Zap}
                  color="bg-orange-500"
                />
              </div>

              {/* Recent Achievements */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.filter(a => a.unlocked).slice(0, 4).map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{achievement.title}</h5>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">+{achievement.points}</p>
                        <p className="text-xs text-gray-500">Points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">All Achievements</h4>
                <p className="text-sm text-gray-600">
                  {achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 border rounded-lg transition-all ${
                      achievement.unlocked 
                        ? 'bg-white border-green-200 shadow-sm' 
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className={`font-medium ${achievement.unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                            {achievement.title}
                          </h5>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(achievement.category)}`}>
                            {achievement.category}
                          </span>
                        </div>
                        <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                          {achievement.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${achievement.unlocked ? 'text-green-600' : 'text-gray-400'}`}>
                          {achievement.unlocked ? '+' : ''}{achievement.points}
                        </p>
                        <p className="text-xs text-gray-500">Points</p>
                      </div>
                    </div>
                    {achievement.unlocked && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        Unlocked
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-900">Team Leaderboard</h4>
              
              <div className="space-y-3">
                {[
                  { rank: 1, name: 'Sarah Johnson', role: 'Manager', points: 2350, avatar: 'SJ' },
                  { rank: 2, name: 'Mike Chen', role: 'Employee', points: 1890, avatar: 'MC' },
                  { rank: 3, name: user?.fullName || 'You', role: userRole, points: stats.totalPoints, avatar: 'YOU', isCurrentUser: true },
                  { rank: 4, name: 'Emily Davis', role: 'Employee', points: 1100, avatar: 'ED' },
                  { rank: 5, name: 'Alex Rodriguez', role: 'Intern', points: 850, avatar: 'AR' }
                ].map((player) => (
                  <div 
                    key={player.rank} 
                    className={`flex items-center gap-4 p-4 border rounded-lg ${
                      player.isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        player.rank === 1 ? 'bg-yellow-500 text-white' :
                        player.rank === 2 ? 'bg-gray-400 text-white' :
                        player.rank === 3 ? 'bg-orange-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {player.rank}
                      </div>
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{player.avatar}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{player.name}</h5>
                      <p className="text-sm text-gray-600 capitalize">{player.role}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{player.points.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Points</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
