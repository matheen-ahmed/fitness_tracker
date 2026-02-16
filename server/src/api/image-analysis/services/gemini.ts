export const analyzeImage = async (base64Image: string) => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Image,
                },
              },
              {
                text: `
Analyze this food image.

Return ONLY valid JSON in this exact format:

{
  "name": "food name",
  "calories": number
}

Do not include explanation.
Do not include markdown.
Return raw JSON only.
`,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  const data: any = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  try {
    return JSON.parse(text);
  } catch {
    console.error("Invalid JSON from Gemini:", text);
    return null;
  }
};
