import { type SavedWord } from "./wordService";

export async function generatePoeticSpark(words: SavedWord[], vibe: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please add VITE_GEMINI_API_KEY to your .env file.");
  }

  const wordList = words.map((w) => w.word).join(", ");
  const vibeText = vibe ? `The poem should capture this vibe: "${vibe}".` : "Invent a beautiful, lyrical theme based on these words.";

  const prompt = `You are a poetic muse. Your task is to write EXACTLY two lines of beautiful, profound poetry.
You MUST incorporate as many of these words as possible naturally: ${wordList}.
${vibeText}
Do not include any commentary, titles, or quotation marks. Just output the two lines of poetry.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      throw new Error(`Failed to generate spark: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("No poetry generated.");
    }

    return text.trim();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}
