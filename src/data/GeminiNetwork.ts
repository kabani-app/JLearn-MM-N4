export interface GeminiPart {
  text?: string;
}

export interface GeminiContent {
  parts: GeminiPart[];
}

export interface GenerateContentRequest {
  contents: GeminiContent[];
  systemInstruction?: GeminiContent;
}

export interface GeminiCandidate {
  content: GeminiContent;
}

export interface GenerateContentResponse {
  candidates?: GeminiCandidate[];
}

export async function getSynonymsOrAntonyms(
  hiragana: string,
  kanji: string,
  meaning: string,
  mode: 'same' | 'diff'
): Promise<string> {
  // Try to retrieve apiKey from environment variables or localStorage
  let apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
  
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    apiKey = localStorage.getItem('GEMINI_API_KEY') || '';
  }

  if (!apiKey) {
    return 'ချိတ်ဆက်မရပါ (API Key is missing. Please configure it in AI Studio Secrets or the settings gear!)';
  }

  const prompt = mode === 'same'
    ? `The Japanese word is "${hiragana}" (${kanji}) meaning "${meaning}" in Myanmar.
List 3-4 Japanese synonyms (same/similar meaning). For each: hiragana, kanji, Myanmar meaning.
Format each line: • [hiragana] [kanji] — [Myanmar meaning]
No extra text.`
    : `The Japanese word is "${hiragana}" (${kanji}) meaning "${meaning}" in Myanmar.
List 3-4 Japanese antonyms (opposite/contrasting meaning). For each: hiragana, kanji, Myanmar meaning.
Format each line: • [hiragana] [kanji] — [Myanmar meaning]
No extra text.`;

  const requestBody: GenerateContentRequest = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      if (response.status === 400) {
        return 'API Key Error (400) - API key may be invalid or restricted.';
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GenerateContentResponse = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return responseText || 'No response from AI.';
  } catch (error) {
    console.error('Gemini call error:', error);
    return `အမှားဖြစ်သွားပါသည်: ${(error as Error).message || 'Unknown error'}`;
  }
}
