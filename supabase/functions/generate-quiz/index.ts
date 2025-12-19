import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const text = formData.get('text') as string || '';
    const difficulty = (formData.get('difficulty') as string || 'medium').toLowerCase();
    const mcqs = parseInt(formData.get('mcqs') as string || '0');
    const fibs = parseInt(formData.get('fibs') as string || '0');
    const tfs = parseInt(formData.get('tfs') as string || '0');

    const paragraph = text.trim();

    if (!paragraph) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🌌 Generating questions with Groq API...');
    const questions = await generateQuestions(paragraph, mcqs, fibs, tfs, difficulty);

    if (!questions || questions.error) {
      return new Response(
        JSON.stringify({ error: questions?.error || 'Failed to generate questions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in generate-quiz function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateQuestions(
  paragraph: string,
  numMcqs: number,
  numFibs: number,
  numTfs: number,
  difficulty: string
) {
  try {
    const apiKey = Deno.env.get('GROQ_API_KEY');
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const inputTokens = paragraph.split(/\s+/).length;
    const maxInputTokens = 4000;
    const maxOutputTokens = 3000;
    const tokensPerQuestion = 120;

    // Limit input size
    if (inputTokens > maxInputTokens) {
      paragraph = paragraph.split(/\s+/).slice(0, maxInputTokens).join(' ');
    }

    const totalRequestedTokens = tokensPerQuestion * (numMcqs + numFibs + numTfs);
    if (totalRequestedTokens > maxOutputTokens) {
      return { error: '⚠️ Token limit exceeded. Try fewer questions.' };
    }

    const difficultyPrompt = difficulty === 'easy' ? 'Make questions straightforward and basic.' :
      difficulty === 'hard' ? 'Make questions challenging and require deep understanding.' :
      'Make questions moderately challenging.';

    const prompt = `
You are an expert AI question generator.
Generate exactly ${numMcqs} multiple-choice questions, ${numFibs} fill-in-the-blank questions, and ${numTfs} True/False questions from the following text.
${difficultyPrompt}

Text:
${paragraph}

Rules:
1. Cover distinct ideas across questions; avoid duplicates within each category.
2. Use clear, concise phrasing and test understanding (not copy-paste trivia).
3. MCQs: exactly 4 options (a–d), one correct. Distractors must be plausible but clearly wrong. Avoid "All of the above" and double negatives.
4. F-I-Bs: use a single blank (__________) for a key term/phrase from the text; keep grammar correct.
5. T or F: statements must be factual and directly verifiable from the text.
6. Output ONLY the format below. Do not include explanations.
7. For MCQs, the Answer must be the EXACT TEXT of the correct option, not the letter.

Format the response as follows:

MCQs:
Q1: [Question text]
a) [Option 1]
b) [Option 2]
c) [Option 3]
d) [Option 4]
Answer: [Exact text of the correct option]

F-I-Bs:
Q1: [Sentence with a blank like __________]
Answer: [Correct Answer]

T or F:
Q1: [Statement]
Answer: [True/False]
`;


    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: totalRequestedTokens,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return { error: 'Rate limit exceeded. Please wait and try again.' };
      }
      if (response.status === 402) {
        return { error: 'AI usage credits required. Please add credits to continue.' };
      }
      const errorText = await response.text();
      console.error('🚨 AI Gateway error:', response.status, errorText);
      return { error: `AI gateway error: ${response.status}` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    console.log('✅ Questions generated successfully');

    return content;
  } catch (error) {
    console.error('⚠️ Generation error:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}