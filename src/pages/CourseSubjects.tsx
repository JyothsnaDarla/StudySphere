import { useParams, Link } from 'react-router-dom';
import {
  Calculator,
  Atom,
  TestTube,
  History,
  Globe,
  BookOpen,
  Code,
  Database,
  Cog,
  Building2,
  Cpu,
  BrainCircuit,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const courseSubjects: Record<string, any[]> = {
  jee: [
    {
      id: 'mathematics',
      name: 'Mathematics',
      icon: Calculator,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      notionUrl: 'https://www.notion.so/jee-mathematics-study-materials',
    },
    {
      id: 'physics',
      name: 'Physics',
      icon: Atom,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      notionUrl: 'https://www.notion.so/jee-physics-study-materials',
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      icon: TestTube,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      notionUrl: 'https://www.notion.so/Chemistry-27047f663b908030bb34c81eb01a20b0',
    },
  ],
  gate: [
    {
      id: 'mathematics',
      name: 'CSE',
      icon: Calculator,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      notionUrl: 'https://www.notion.so/CSE-245b44b19c94801a9cf7c657be158ff8',
    },
    {
      id: 'computer-science',
      name: 'ECE',
      icon: Code,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      notionUrl: 'https://www.notion.so/ECE-28520c410d3e80a389c2ceecbb04832d',
    },
    {
      id: 'database',
      name: 'EEE',
      icon: Database,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      notionUrl: 'https://www.notion.so/gate-eee-study-materials',
    },
    {
      id: 'mechanical',
      name: 'Mechanical',
      icon: Cog,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      notionUrl: 'https://www.notion.so/gate-mechanical-study-materials',
    },
    {
      id: 'civil',
      name: 'Civil',
      icon: Building2,
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      notionUrl: 'https://www.notion.so/CIVIL-25320c410d3e805d9135e8cb6e526136',
    },
    {
      id: 'cai',
      name: 'CAI',
      icon: Cpu,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      notionUrl: 'https://www.notion.so/CAI-275b44b19c9480bebeb7ec4de9eb2010',
    },
    {
      id: 'aiml',
      name: 'AIML',
      icon: BrainCircuit,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      notionUrl: 'https://www.notion.so/GATE-AIML-Study-Materials',
    },
  ],
  upsc: [
    {
      id: 'history',
      name: 'History',
      icon: History,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      notionUrl: 'https://notion.so',
    },
    {
      id: 'geography',
      name: 'Geography',
      icon: Globe,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      notionUrl: 'https://notion.so',
    },
    {
      id: 'general-studies',
      name: 'General Studies',
      icon: BookOpen,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      notionUrl: 'https://notion.so',
    },
  ],
  set: [
    {
      id: 'general-knowledge',
      name: 'General Knowledge',
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      notionUrl: 'https://notion.so',
    },
    {
      id: 'reasoning',
      name: 'Reasoning',
      icon: Calculator,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      notionUrl: 'https://notion.so',
    },
  ],
  net: [
    {
      id: 'research-aptitude',
      name: 'Research Aptitude',
      icon: BookOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      notionUrl: 'https://notion.so',
    },
    {
      id: 'teaching-aptitude',
      name: 'Teaching Aptitude',
      icon: Calculator,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      notionUrl: 'https://notion.so',
    },
  ],
};

export default function CourseSubjects() {
  const { courseId } = useParams<{ courseId: string }>();
  const subjects = courseSubjects[courseId || ''] || [];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <Link to="/study-materials">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">{courseId?.toUpperCase()}</span> Subjects
          </h1>
          <p className="text-muted-foreground text-lg">
            Select a subject to access study materials
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {subjects.map((subject) => (
            <a
              key={subject.id}
              href={subject.notionUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="group glass border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 h-full">
                <CardHeader>
                  <div
                    className={`${subject.bgColor} rounded-2xl w-16 h-16 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <subject.icon className={`h-8 w-8 ${subject.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{subject.name}</CardTitle>
                  <CardDescription>Access comprehensive study materials</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Click to open in Notion</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}