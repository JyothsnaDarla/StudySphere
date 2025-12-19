import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GraduationCap, Building2, School, Brain } from 'lucide-react';

export default function StudyMaterials() {
  const courses = [
    {
      id: 'gate',
      title: 'GATE',
      description: 'Graduate Aptitude Test in Engineering',
      icon: GraduationCap,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      id: 'jee',
      title: 'JEE',
      description: 'Joint Entrance Examination',
      icon: Brain,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      id: 'upsc',
      title: 'UPSC',
      description: 'Union Public Service Commission',
      icon: Building2,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      id: 'set',
      title: 'SET',
      description: 'State Eligibility Test',
      icon: School,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      id: 'net',
      title: 'NET',
      description: 'National Eligibility Test',
      icon: BookOpen,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Study Materials</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Choose your exam category to access comprehensive study resources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {courses.map((course) => (
            <Link key={course.id} to={`/study-materials/${course.id}`}>
              <Card className="group glass border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 h-full">
                <CardHeader>
                  <div className={`${course.bgColor} rounded-2xl w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <course.icon className={`h-8 w-8 ${course.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Click to explore subjects and materials
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
