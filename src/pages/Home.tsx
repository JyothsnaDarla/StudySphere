import { Link } from 'react-router-dom';
import { BookOpen, Award, Newspaper, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const features = [
    {
      icon: BookOpen,
      title: 'Study Materials',
      description: 'Access comprehensive study materials loan-codes',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Award,
      title: 'Interactive Quizzes',
      description: 'Test your knowledge with adaptive quizzes and instant feedback',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      icon: Newspaper,
      title: 'Latest News',
      description: 'Stay updated with exam notifications and educational updates',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Clock,
      title: 'Flexible Learning',
      description: 'Study at your own pace with 24/7 access',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="gradient-text">Study Sphere</span>
            <span className="text-foreground"> — Your eStudy Hub</span>
          </h1>
            <p>No clutter. No distractions.</p>
          
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">What You'll Get</h2>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            Comprehensive resources for effective exam preparation
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group glass border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <CardContent className="p-6 text-center">
                  <div className={`${feature.bgColor} rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 gradient-bg">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already preparing smarter with Study Sphere
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="rounded-full px-8">
                Get Started
              </Button>
            </Link>
            <Link to="/study-materials">
              <Button size="lg" variant="outline" className="rounded-full px-8">
                Explore Materials
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
