// Gemini API 클라이언트 헬퍼

export interface GeminiRequestOptions {
  apiKey?: string;
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  /** true면 responseMimeType=application/json 으로 요청 (파싱 안정성 ↑) */
  json?: boolean;
}

const DEFAULT_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
  'gemini-3.8-flash',
  'gemini-3-flash-preview',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
  'gemini-pro-latest'
];

export async function callGemini(
  prompt: string,
  options: GeminiRequestOptions = {}
): Promise<string> {
  const serverKey = process.env.GEMINI_API_KEY || '';
  const apiKey = (options.apiKey && options.apiKey.trim().length > 0) ? options.apiKey.trim() : serverKey;

  if (!apiKey) {
    throw new Error('Gemini API Key가 설정되지 않았습니다. 설정 탭에서 API Key를 입력해주세요.');
  }

  // 사용자가 지정한 모델이 있으면 최우선으로 시도하고, 없으면 DEFAULT_MODELS 순서대로 시도
  const modelsToTry = options.model 
    ? [options.model, ...DEFAULT_MODELS.filter(m => m !== options.model)]
    : DEFAULT_MODELS;

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const bodyPayload: Record<string, unknown> = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          ...(options.json ? { responseMimeType: 'application/json' } : {}),
        }
      };

      if (options.systemInstruction) {
        bodyPayload.systemInstruction = {
          parts: [{ text: options.systemInstruction }]
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errMsg = errorData?.error?.message || `HTTP ${response.status} ${response.statusText}`;
        
        // 404 (모델 미지원) 또는 503 (모델 일시 불가)인 경우 다음 fallback 모델 시도
        if (response.status === 404 || response.status === 503) {
          lastError = new Error(`[${model}] ${errMsg}`);
          continue;
        }
        
        throw new Error(`Gemini API Error (${response.status}): ${errMsg}`);
      }

      const data = await response.json();
      const parts: { text?: string; thought?: boolean }[] = data?.candidates?.[0]?.content?.parts ?? [];
      const text = parts.filter((p) => !p.thought && p.text).map((p) => p.text).join('');
      
      if (!text) {
        throw new Error('Gemini로부터 유효한 텍스트 응답을 받지 못했습니다.');
      }

      return text;
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      lastError = errorObj;
      // 네트워크 장애나 모델 404 외에 API 키 오류(400, 403) 등은 루프 중단
      if (errorObj.message.includes('API_KEY_INVALID') || errorObj.message.includes('403')) {
        throw errorObj;
      }
    }
  }

  throw lastError || new Error('사용 가능한 Gemini 모델에 연결할 수 없습니다.');
}

/**
 * AI 응답 텍스트에서 JSON 객체/배열을 안전하게 추출하여 파싱합니다.
 */
export function extractJSON<T>(text: string): T {
  try {
    // 1. 순수 JSON 파싱 시도
    return JSON.parse(text) as T;
  } catch {
    // 2. ```json ... ``` 코드블록 추출
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        return JSON.parse(codeBlockMatch[1].trim()) as T;
      } catch (err) {
        // 계속 진행
      }
    }

    // 3. 첫 번째 { 또는 [ 부터 마지막 } 또는 ] 까지 잘라내기
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    
    let startIndex = -1;
    let endIndex = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIndex = firstBrace;
      endIndex = text.lastIndexOf('}');
    } else if (firstBracket !== -1) {
      startIndex = firstBracket;
      endIndex = text.lastIndexOf(']');
    }

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const jsonCandidate = text.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonCandidate) as T;
    }

    throw new Error('JSON 형식의 응답을 파싱할 수 없습니다: ' + text.slice(0, 150));
  }
}
