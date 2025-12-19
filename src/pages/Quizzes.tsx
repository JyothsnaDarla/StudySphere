import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Question = {
  type: string;
  text: string;
  options: string[];
  answer: string;
};

type UserAnswer = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
};

export default function Quizzes() {
  const [difficulty, setDifficulty] = useState('medium');
  const [textInput, setTextInput] = useState('');
  const [mcqs, setMcqs] = useState(2);
  const [fibs, setFibs] = useState(2);
  const [tfs, setTfs] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  const fuzzyMatch = (selectedText: string, correctAnswer: string) => {
    const normalizedSelected = normalize(selectedText);
    const normalizedCorrect = normalize(correctAnswer);
    return normalizedSelected === normalizedCorrect || 
           normalizedCorrect.includes(normalizedSelected) || 
           normalizedSelected.includes(normalizedCorrect);
  };

  const parseQuestions = (text: string): Question[] => {
    const questions: Question[] = [];
    let category = '';
    
    text.split('\n').filter(l => l.trim()).forEach(line => {
      if (/^(MCQs|F-I-Bs|T or F):/.test(line)) {
        category = line.split(':')[0].trim();
      } else if (/^Q\d+:/.test(line)) {
        let qText = line.split(': ')[1];
        if (category === 'T or F') {
          qText = qText.replace(/\s*Answer:\s*(True|False)\s*$/i, '').trim();
        }
        questions.push({
          type: category,
          text: qText,
          options: [],
          answer: ''
        });
      } else if (/^[a-d]\)/.test(line) && questions.length) {
        questions[questions.length - 1].options.push(line.slice(3));
      } else if (/^Answer:/.test(line) && questions.length) {
        questions[questions.length - 1].answer = line.split(': ')[1].trim();
      }
    });
    
    return questions;
  };

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      setShowResults(false);
      setQuizStarted(false);
      setQuizFinished(false);
      setCurrentQuestionIndex(0);
      setScore(0);
      setUserAnswers([]);

      if (!textInput.trim()) {
        toast({
          title: "Error",
          description: "Please provide text to generate quiz",
          variant: "destructive"
        });
        return;
      }

      const formData = new FormData();
      formData.append('text', textInput.trim());
      formData.append('difficulty', difficulty);
      formData.append('mcqs', mcqs.toString());
      formData.append('fibs', fibs.toString());
      formData.append('tfs', tfs.toString());

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-quiz`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        let message = 'Failed to generate questions';
        try {
          const error = await response.json();
          message = error.error || message;
        } catch {}
        throw new Error(message);
      }

      const data = await response.json();
      const questions = parseQuestions(data.questions || '');

      if (!questions.length) {
        throw new Error('No questions were generated.');
      }

      setCurrentQuestions(questions);
      setQuizStarted(true);

      toast({
        title: "Success!",
        description: `Generated ${questions.length} questions`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate quiz',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const recordAnswer = (ans: string) => {
    if (showFeedback) return;

    const q = currentQuestions[currentQuestionIndex];
    let isCorrect = false;
    let userAns = ans;

    if (q.type === 'MCQs') {
      const selectedOptionText = q.options[ans.charCodeAt(0) - 97];
      isCorrect = fuzzyMatch(selectedOptionText, q.answer);
      userAns = `${ans}) ${selectedOptionText}`;
    } else {
      isCorrect = fuzzyMatch(ans, q.answer);
    }

    if (isCorrect) setScore(prev => prev + 1);
    
    setUserAnswers(prev => [...prev, {
      question: q.text,
      userAnswer: userAns,
      correctAnswer: q.answer,
      isCorrect
    }]);

    setShowFeedback(true);

    setTimeout(async () => {
      setShowFeedback(false);
      setSelectedAnswer('');
      
      if (currentQuestionIndex + 1 < currentQuestions.length) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setQuizFinished(true);
        setQuizStarted(false);
        
        // Save quiz results to database
        if (userId) {
          const scorePercentage = ((score + (isCorrect ? 1 : 0)) / currentQuestions.length) * 100;
          const quizTypes = [...new Set(currentQuestions.map(q => q.type))].join(', ');
          
          try {
            await supabase.from('quiz_attempts').insert({
              user_id: userId,
              total_questions: currentQuestions.length,
              correct_answers: score + (isCorrect ? 1 : 0),
              score_percentage: scorePercentage,
              difficulty: difficulty,
              quiz_type: quizTypes
            });
          } catch (error) {
            console.error('Failed to save quiz results:', error);
          }
        }
      }
    }, 800);
  };

  const currentQuestion = currentQuestions[currentQuestionIndex];

  if (quizStarted && currentQuestion) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-center">
                Question {currentQuestionIndex + 1} of {currentQuestions.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className="text-xl font-medium">{currentQuestion.text}</h3>

              {currentQuestion.type === 'MCQs' && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt, i) => {
                    const optionLetter = String.fromCharCode(97 + i);
                    const isSelected = selectedAnswer === optionLetter;
                    const isCorrect = showFeedback && fuzzyMatch(opt, currentQuestion.answer);
                    const isIncorrect = showFeedback && isSelected && !fuzzyMatch(opt, currentQuestion.answer);
                    
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          if (!showFeedback) {
                            setSelectedAnswer(optionLetter);
                            recordAnswer(optionLetter);
                          }
                        }}
                        disabled={showFeedback}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          isCorrect ? 'border-success bg-success/20 text-success-foreground' :
                          isIncorrect ? 'border-destructive bg-destructive/20 text-destructive-foreground' :
                          isSelected ? 'border-primary bg-primary/10' :
                          'border-border hover:border-primary/50'
                        }`}
                      >
                        {optionLetter}) {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {currentQuestion.type === 'F-I-Bs' && (
                <div className="space-y-3">
                  <Input
                    id="fib-answer"
                    placeholder="Type your answer..."
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    disabled={showFeedback}
                    className={showFeedback ? 
                      (fuzzyMatch(selectedAnswer, currentQuestion.answer) ? 'border-success' : 'border-destructive') 
                      : ''
                    }
                  />
                  <Button 
                    onClick={() => recordAnswer(selectedAnswer.trim())}
                    disabled={!selectedAnswer.trim() || showFeedback}
                    className="w-full"
                  >
                    Submit Answer
                  </Button>
                  {showFeedback && !fuzzyMatch(selectedAnswer, currentQuestion.answer) && (
                    <p className="text-sm text-success">
                      Correct answer: {currentQuestion.answer}
                    </p>
                  )}
                </div>
              )}

              {currentQuestion.type === 'T or F' && (
                <div className="grid grid-cols-2 gap-4">
                  {['True', 'False'].map((option) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = showFeedback && fuzzyMatch(option, currentQuestion.answer);
                    const isIncorrect = showFeedback && isSelected && !fuzzyMatch(option, currentQuestion.answer);
                    
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          if (!showFeedback) {
                            setSelectedAnswer(option);
                            recordAnswer(option);
                          }
                        }}
                        disabled={showFeedback}
                        className={`p-4 rounded-lg border-2 font-medium transition-all ${
                          isCorrect ? 'border-success bg-success/20 text-success-foreground' :
                          isIncorrect ? 'border-destructive bg-destructive/20 text-destructive-foreground' :
                          isSelected ? 'border-primary bg-primary/10' :
                          'border-border hover:border-primary/50'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl space-y-6">
          <Card className="glass border-border/50 bg-gradient-to-r from-primary/20 to-secondary/20">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold text-center mb-2">Quiz Complete! 🎉</h3>
              <p className="text-center text-3xl font-bold gradient-text">
                Your Score: {score}/{currentQuestions.length}
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={() => setShowResults(!showResults)} className="flex-1">
              {showResults ? 'Hide Results' : 'Show Results'}
            </Button>
            <Button 
              onClick={() => {
                setQuizFinished(false);
                setCurrentQuestions([]);
              }} 
              variant="outline"
              className="flex-1"
            >
              New Quiz
            </Button>
          </div>

          {showResults && (
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle>Quiz Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userAnswers.map((ua, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-border/50 space-y-2">
                    <p className="font-medium">Q{idx + 1}: {ua.question}</p>
                    <p className={`text-sm ${ua.isCorrect ? 'text-success' : 'text-destructive'}`}>
                      Your Answer: {ua.userAnswer}
                    </p>
                    {!ua.isCorrect && (
                      <p className="text-sm text-success">
                        Correct Answer: {ua.correctAnswer}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="gradient-text">AI-Powered Quizzes</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Generate custom quizzes from your study text
          </p>
        </div>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle>Create Your Quiz</CardTitle>
            <CardDescription>
              Enter your study text to generate personalized quiz questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="text-input">Study Material</Label>
              <Textarea
                id="text-input"
                placeholder="Paste your study material here..."
                className="min-h-[200px]"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mcqs">MCQs</Label>
                <Input
                  id="mcqs"
                  type="number"
                  min="0"
                  max="10"
                  value={mcqs}
                  onChange={(e) => setMcqs(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fibs">Fill in Blanks</Label>
                <Input
                  id="fibs"
                  type="number"
                  min="0"
                  max="10"
                  value={fibs}
                  onChange={(e) => setFibs(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tfs">True/False</Label>
                <Input
                  id="tfs"
                  type="number"
                  min="0"
                  max="10"
                  value={tfs}
                  onChange={(e) => setTfs(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Quiz with AI'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
