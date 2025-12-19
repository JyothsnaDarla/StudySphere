import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Trophy, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type QuizAttempt = {
  id: string;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  difficulty: string;
  quiz_type: string;
  created_at: string;
};

export default function Performance() {
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setQuizzes(data || []);
      }
      setIsLoading(false);
    };

    fetchQuizzes();
  }, []);

  const totalQuizzes = quizzes.length;
  const avgScore = totalQuizzes > 0 
    ? (quizzes.reduce((sum, q) => sum + q.score_percentage, 0) / totalQuizzes).toFixed(1)
    : '0';
  const bestScore = totalQuizzes > 0 
    ? Math.max(...quizzes.map(q => q.score_percentage)).toFixed(1)
    : '0';
  
  const recentQuizzes = quizzes.slice(0, 5);
  const olderQuizzes = quizzes.slice(5, 10);
  const improvement = recentQuizzes.length > 0 && olderQuizzes.length > 0
    ? (
        (recentQuizzes.reduce((sum, q) => sum + q.score_percentage, 0) / recentQuizzes.length) -
        (olderQuizzes.reduce((sum, q) => sum + q.score_percentage, 0) / olderQuizzes.length)
      ).toFixed(1)
    : '0';

  const stats = [
    {
      title: 'Total Quizzes',
      value: totalQuizzes.toString(),
      icon: BarChart3,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Average Score',
      value: `${avgScore}%`,
      icon: Target,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Best Score',
      value: `${bestScore}%`,
      icon: Trophy,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Improvement',
      value: `${improvement > '0' ? '+' : ''}${improvement}%`,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">
          <span className="gradient-text">Performance Dashboard</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="glass border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} rounded-lg p-2`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Quiz History</CardTitle>
            <CardDescription>
              Your recent quiz attempts and scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : quizzes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No quiz attempts yet</p>
                <p className="text-sm mt-2">Take your first quiz to see your performance metrics</p>
              </div>
            ) : (
              <div className="space-y-3">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="p-4 rounded-lg border border-border/50 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{quiz.quiz_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(quiz.created_at).toLocaleDateString()} • {quiz.difficulty}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          quiz.score_percentage >= 70 ? 'text-success' : 
                          quiz.score_percentage >= 50 ? 'text-accent' : 
                          'text-destructive'
                        }`}>
                          {quiz.score_percentage.toFixed(0)}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {quiz.correct_answers}/{quiz.total_questions}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
