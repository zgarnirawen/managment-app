import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock data for gamification system
    // In a real implementation, this would come from the database
    const mockData = {
      totalPoints: 2850,
      currentStreak: 12,
      longestStreak: 28,
      level: 7,
      nextLevelPoints: 3000,
      currentLevelPoints: 2850,
      
      achievements: [
        {
          id: '1',
          name: 'Task Master',
          description: 'Complete 100 tasks',
          icon: 'task_master',
          category: 'Productivity',
          requirement: 100,
          progress: 100,
          isUnlocked: true,
          unlockedAt: '2025-08-15T10:30:00Z',
          points: 500,
        },
        {
          id: '2',
          name: 'Early Bird',
          description: 'Clock in before 8 AM for 30 days',
          icon: 'early_bird',
          category: 'Attendance',
          requirement: 30,
          progress: 30,
          isUnlocked: true,
          unlockedAt: '2025-08-20T07:45:00Z',
          points: 300,
        },
        {
          id: '3',
          name: 'Team Player',
          description: 'Collaborate on 50 projects',
          icon: 'team_player',
          category: 'Collaboration',
          requirement: 50,
          progress: 35,
          isUnlocked: false,
          points: 400,
        },
        {
          id: '4',
          name: 'Speedster',
          description: 'Complete tasks 20% faster than average',
          icon: 'speedster',
          category: 'Efficiency',
          requirement: 10,
          progress: 8,
          isUnlocked: false,
          points: 600,
        },
        {
          id: '5',
          name: 'Perfectionist',
          description: 'Complete 25 tasks without revisions',
          icon: 'perfectionist',
          category: 'Quality',
          requirement: 25,
          progress: 25,
          isUnlocked: true,
          unlockedAt: '2025-08-25T14:20:00Z',
          points: 450,
        },
        {
          id: '6',
          name: 'Consistency Champion',
          description: 'Work for 60 consecutive days',
          icon: 'consistency',
          category: 'Dedication',
          requirement: 60,
          progress: 45,
          isUnlocked: false,
          points: 800,
        },
      ],

      badges: [
        {
          id: '1',
          name: 'Golden Hour',
          description: 'Worked during peak productivity hours',
          icon: 'crown',
          rarity: 'legendary' as const,
          earnedAt: '2025-08-15T16:00:00Z',
        },
        {
          id: '2',
          name: 'Innovation Spark',
          description: 'Contributed a game-changing idea',
          icon: 'award',
          rarity: 'epic' as const,
          earnedAt: '2025-08-18T11:30:00Z',
        },
        {
          id: '3',
          name: 'Helpful Colleague',
          description: 'Assisted team members frequently',
          icon: 'star',
          rarity: 'rare' as const,
          earnedAt: '2025-08-22T09:15:00Z',
        },
        {
          id: '4',
          name: 'Time Master',
          description: 'Excellent time management skills',
          icon: 'medal',
          rarity: 'common' as const,
          earnedAt: '2025-08-24T13:45:00Z',
        },
      ],

      leaderboard: [
        {
          rank: 1,
          employeeId: 'emp1',
          employeeName: 'Sarah Chen',
          avatar: '/avatars/sarah.jpg',
          totalPoints: 3420,
          weeklyPoints: 485,
          achievements: 12,
          badges: 8,
          streak: 21,
        },
        {
          rank: 2,
          employeeId: 'emp2',
          employeeName: 'Michael Rodriguez',
          avatar: '/avatars/michael.jpg',
          totalPoints: 3180,
          weeklyPoints: 420,
          achievements: 10,
          badges: 6,
          streak: 15,
        },
        {
          rank: 3,
          employeeId: 'current',
          employeeName: 'You',
          avatar: '/avatars/current.jpg',
          totalPoints: 2850,
          weeklyPoints: 380,
          achievements: 8,
          badges: 4,
          streak: 12,
        },
        {
          rank: 4,
          employeeId: 'emp4',
          employeeName: 'Emily Johnson',
          avatar: '/avatars/emily.jpg',
          totalPoints: 2650,
          weeklyPoints: 340,
          achievements: 7,
          badges: 5,
          streak: 8,
        },
        {
          rank: 5,
          employeeId: 'emp5',
          employeeName: 'David Kim',
          avatar: '/avatars/david.jpg',
          totalPoints: 2400,
          weeklyPoints: 290,
          achievements: 6,
          badges: 3,
          streak: 5,
        },
        {
          rank: 6,
          employeeId: 'emp6',
          employeeName: 'Lisa Wang',
          avatar: '/avatars/lisa.jpg',
          totalPoints: 2200,
          weeklyPoints: 260,
          achievements: 5,
          badges: 4,
          streak: 10,
        },
        {
          rank: 7,
          employeeId: 'emp7',
          employeeName: 'James Wilson',
          avatar: '/avatars/james.jpg',
          totalPoints: 1950,
          weeklyPoints: 220,
          achievements: 4,
          badges: 2,
          streak: 3,
        },
        {
          rank: 8,
          employeeId: 'emp8',
          employeeName: 'Anna Martinez',
          avatar: '/avatars/anna.jpg',
          totalPoints: 1750,
          weeklyPoints: 180,
          achievements: 3,
          badges: 3,
          streak: 7,
        },
      ],
    };

    return NextResponse.json(mockData);

  } catch (error) {
    console.error('Error fetching gamification data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gamification data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, data } = await request.json();

    switch (action) {
      case 'unlock_achievement':
        // In a real implementation, verify if the user has met the requirements
        // and update the database accordingly
        return NextResponse.json({
          success: true,
          message: `Achievement "${data.achievementName}" unlocked!`,
          pointsEarned: data.points,
        });

      case 'award_badge':
        // Award a badge to the user
        return NextResponse.json({
          success: true,
          message: `Badge "${data.badgeName}" awarded!`,
          badge: {
            id: Date.now().toString(),
            name: data.badgeName,
            description: data.description,
            icon: data.icon,
            rarity: data.rarity,
            earnedAt: new Date().toISOString(),
          },
        });

      case 'update_streak':
        // Update user's streak
        return NextResponse.json({
          success: true,
          newStreak: data.streakCount,
          bonusPoints: data.streakCount > 7 ? 50 : 0,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing gamification action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
