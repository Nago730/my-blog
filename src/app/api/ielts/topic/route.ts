import { NextResponse } from 'next/server';
import { callGemini, extractJSON } from '@/lib/gemini';
import { IELTSTopic, PRESET_TOPICS } from '@/data/ielts-topics';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { taskType = 'task2', category, subType, apiKey, model } = body;

    const systemInstruction = `You are an official Cambridge IELTS Writing Examiner with extensive experience designing authentic IELTS test prompts.
Your task is to generate a realistic, challenging, and strictly formatted IELTS Writing prompt.
Return ONLY valid JSON format without markdown wrapping outside the JSON.`;

    const promptText = `Generate a brand-new IELTS Writing prompt with the following specifications:
- Task Type: ${taskType === 'task1' ? 'Task 1 (Academic or General Training)' : 'Task 2 (Essay)'}
${category ? `- Preferred Category: ${category}` : '- Any common IELTS theme (e.g., Environment, Education, Society, Technology, Health, Economy)'}
${subType ? `- Sub-type / Question form: ${subType}` : ''}

Strictly output the response as a JSON object adhering to this schema:
{
  "id": "generated-${Date.now()}",
  "taskType": "${taskType}",
  "subType": "e.g., Agree / Disagree or Bar Chart or Formal Letter",
  "category": "e.g., Technology",
  "title": "A short descriptive title in English",
  "prompt": "The exact official IELTS prompt statement",
  "instructions": [
    "Give reasons for your answer and include relevant examples...",
    "Write at least ${taskType === 'task1' ? '150' : '250'} words."
  ],
  ${taskType === 'task1' ? '"dataDescription": "Summary of data/chart points or letter scenario background",' : ''}
  "recommendedMinutes": ${taskType === 'task1' ? 20 : 40},
  "minWords": ${taskType === 'task1' ? 150 : 250}
}`;

    try {
      const aiResponse = await callGemini(promptText, {
        apiKey,
        model,
        systemInstruction,
        temperature: 0.8,
      });

      const parsed = extractJSON<IELTSTopic>(aiResponse);
      return NextResponse.json({ success: true, topic: parsed, source: 'gemini' });
    } catch (aiError: unknown) {
      console.warn('Gemini topic generation failed, falling back to preset:', aiError);
      
      // AI 호출 실패 시 관련 프리셋에서 랜덤 추출하여 안정성 보장
      const matchingPresets = PRESET_TOPICS.filter(t => t.taskType === taskType);
      const selected = matchingPresets[Math.floor(Math.random() * matchingPresets.length)] || PRESET_TOPICS[0];
      
      return NextResponse.json({
        success: true,
        topic: { ...selected, id: `preset-${Date.now()}` },
        source: 'preset',
        notice: (aiError instanceof Error) ? aiError.message : 'Preset used due to API response'
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
