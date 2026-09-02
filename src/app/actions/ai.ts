"use server";

/**
 * 음성 인식으로 입력된 다듬어지지 않은 텍스트를 AI(Gemini / OpenAI)를 통해 
 * 일정 및 목표에 적합한 명확하고 정돈된 문구로 변환합니다.
 */
export async function refineVoiceInputWithAI(rawTranscript: string): Promise<{
  success: boolean;
  result: string;
  isAiRefined: boolean;
}> {
  if (!rawTranscript || !rawTranscript.trim()) {
    return { success: false, result: "", isAiRefined: false };
  }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  // 1. Google Gemini API 사용
  if (geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `사용자가 마이크로 자유롭게 말한 한국어 음성 텍스트를 일정/목표 관리 앱에 기입하기 적절하도록 명확하고 간결한 제목 문구로 가다듬어줘.
따옴표, 부연 설명, 인삿말 없이 가다듬어진 핵심 문구만 단답형으로 출력해줘.

[음성 원문]
"${rawTranscript}"`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          // 따옴표 및 불필요한 서식 제거
          const cleanedText = text.replace(/^["'‘“]+|["'’”]+$/g, "").trim();
          return { success: true, result: cleanedText, isAiRefined: true };
        }
      }
    } catch (error) {
      console.error("Gemini API call failed:", error);
    }
  }

  // 2. OpenAI API 사용 (Fallback)
  if (openAiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "사용자가 마이크로 말한 음성 텍스트를 일정/목표 제목에 맞게 간결하고 명확하게 정돈해줘. 따옴표나 추가 설명 없이 완성된 제목만 반환해.",
            },
            { role: "user", content: rawTranscript },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) {
          const cleanedText = text.replace(/^["'‘“]+|["'’”]+$/g, "").trim();
          return { success: true, result: cleanedText, isAiRefined: true };
        }
      }
    } catch (error) {
      console.error("OpenAI API call failed:", error);
    }
  }

  // API 키가 설정되지 않았거나 실패한 경우 원본 텍스트 반환
  return {
    success: true,
    result: rawTranscript.trim(),
    isAiRefined: false,
  };
}
