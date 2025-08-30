'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Target, 
  Award, 
  TrendingUp,
  Users,
  Calendar,
  Zap,
  Crown,
  Medal,
  Flame,
  BarChart3
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  points: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
}

interface LeaderboardEntry {
  rank: number;
  employeeId: string;
  employeeName: string;
  avatar?: string;
  totalPoints: number;
  weeklyPoints: number;
  achievements: number;
  badges: number;
  streak: number;
}

interface GamificationStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  nextLevelPoints: number;
  currentLevelPoints: number;
  achievements: Achievement[];
  badges: Badge[];
  leaderboard: LeaderboardEntry[];
}

const ACHIEVEMENT_ICONS = {
  task_master: Trophy,
  early_bird: Star,
  team_player: Users,
  speedster: Zap,
  perfectionist: Target,
  dedication: Calendar,
  innovator: Award,
  mentor: Crown,
  consistency: Medal,
  productivity: TrendingUp,
};

const RARITY_COLORS = {
  common: 'bg-gray-100 text-gray-800 border-gray-300',
  rare: 'bg-blue-100 text-blue-800 border-blue-300',
  epic: 'bg-purple-100 text-purple-800 border-purple-300',
  legendary: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

export default function GamificationPage() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gamification');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (current: number, next: number) => {
    return Math.min((current / next) * 100, 100);
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return Crown;
      case 'epic': return Medal;
      case 'rare': return Award;
      default: return Star;
    }
  };

  if (loading || !stats) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your achievements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Achievements & Recognition
          </h1>
          <p className="text-muted-foreground">Track your progress and compete with colleagues</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Level {stats.level}
          </CardTitle>
          <CardDescription>
            {stats.nextLevelPoints - stats.currentLevelPoints} points to next level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {stats.level + 1}</span>
              <span>{stats.currentLevelPoints}/{stats.nextLevelPoints}</span>
            </div>
            <Progress 
              value={calculateProgress(stats.currentLevelPoints, stats.nextLevelPoints)}
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Flame className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.currentStreak} days</div>
                <p className="text-xs text-muted-foreground">
                  Best: {stats.longestStreak} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                <Trophy className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.achievements.filter(a => a.isUnlocked).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {stats.achievements.length} unlocked
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                <Medal className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.badges.length}</div>
                <p className="text-xs text-muted-foreground">
                  Collection growing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leaderboard Rank</CardTitle>
                <Crown className="h-4 w-4 text-gold-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  #{stats.leaderboard.find(entry => entry.employeeId === 'current')?.rank || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
              <CardDescription>Your latest accomplishments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.achievements
                  .filter(achievement => achievement.isUnlocked)
                  .slice(0, 3)
                  .map((achievement) => {
                    const IconComponent = ACHIEVEMENT_ICONS[achievement.icon as keyof typeof ACHIEVEMENT_ICONS] || Trophy;
                    return (
                      <div key={achievement.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <IconComponent className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.name}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-yellow-600">+{achievement.points}</div>
                          <div className="text-xs text-muted-foreground">
                            {achievement.unlockedAt && new Date(achievement.unlockedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.achievements.map((achievement) => {
              const IconComponent = ACHIEVEMENT_ICONS[achievement.icon as keyof typeof ACHIEVEMENT_ICONS] || Trophy;
              return (
                <Card key={achievement.id} className={achievement.isUnlocked ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
                  <CardHeader className="text-center">
                    <div className={`mx-auto p-3 rounded-full w-fit ${achievement.isUnlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <IconComponent className={`h-8 w-8 ${achievement.isUnlocked ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <CardTitle className={achievement.isUnlocked ? 'text-green-800' : 'text-gray-500'}>
                      {achievement.name}
                    </CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    {!achievement.isUnlocked && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.requirement}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.requirement) * 100}
                          className="h-2"
                        />
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <Badge variant={achievement.isUnlocked ? 'default' : 'secondary'}>
                        {achievement.category}
                      </Badge>
                      <span className="font-bold text-yellow-600">+{achievement.points} pts</span>
                    </div>
                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <p className="text-xs text-muted-foreground">
                        Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.badges.map((badge) => {
              const IconComponent = getRarityIcon(badge.rarity);
              return (
                <Card key={badge.id} className={`border-2 ${RARITY_COLORS[badge.rarity]}`}>
                  <CardHeader className="text-center">
                    <div className="mx-auto p-3 rounded-full w-fit bg-white">
                      <IconComponent className="h-8 w-8 text-current" />
                    </div>
                    <CardTitle>{badge.name}</CardTitle>
                    <CardDescription>{badge.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge className={RARITY_COLORS[badge.rarity]}>
                      {badge.rarity.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Weekly Leaderboard
              </CardTitle>
              <CardDescription>Top performers this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.leaderboard.map((entry, index) => (
                  <div key={entry.employeeId} className={`flex items-center gap-4 p-4 rounded-lg ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-muted'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-500 text-white' : index === 1 ? 'bg-gray-400 text-white' : index === 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {entry.rank}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{entry.employeeName}</h4>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{entry.achievements} achievements</span>
                        <span>{entry.badges} badges</span>
                        <span>{entry.streak} day streak</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-600">{entry.totalPoints}</div>
                      <div className="text-sm text-muted-foreground">
                        +{entry.weeklyPoints} this week
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
