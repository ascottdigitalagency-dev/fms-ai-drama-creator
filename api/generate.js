
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Only POST requests are allowed."
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: "OpenAI API key is not configured on the server."
    });
  }

  const {
    audience,
    situation,
    emotion,
    duration,
    platform
  } = req.body || {};

  if (
    typeof audience !== "string" ||
    typeof situation !== "string" ||
    !audience.trim() ||
    !situation.trim() ||
    audience.length > 200 ||
    situation.length > 2000
  ) {
    return res.status(400).json({
      error: "Please provide a valid audience and story situation."
    });
  }

  const allowedEmotions = [
    "Relatable",
    "Emotional",
    "Suspenseful",
    "Comedy"
  ];

  const allowedDurations = ["15", "30", "60"];

  const allowedPlatforms = [
    "Facebook Reels",
    "TikTok",
    "YouTube Shorts"
  ];

  if (
    !allowedEmotions.includes(emotion) ||
    !allowedDurations.includes(String(duration)) ||
    !allowedPlatforms.includes(platform)
  ) {
    return res.status(400).json({
      error: "Please select valid story options."
    });
  }

  const prompt = `
Create a short Filipino drama for financial advisors.

TARGET AUDIENCE:
${audience}

STORY SITUATION:
${situation}

EMOTION: ${emotion}
DURATION: ${duration} seconds
PLATFORM: ${platform}

Follow this production framework:

1. CHARACTER: Define each character's consistent appearance.
2. ACTION: Describe clear, filmable actions.
3. EMOTION: Show emotions through expressions and behavior.
4. LOCATION: Maintain consistent locations.
5. CAMERA ANGLE: Specify framing and movement.
6. LIGHTING: Describe the lighting and mood.
7. VISUAL STYLE: Maintain a consistent cinematic style.

Use this workflow:
FLOW → SCRIPT → SCENES → CLIPS → EPISODE

Return:
1. A strong opening hook.
2. A complete, concise Filipino or Taglish script.
3. Scene-by-scene dialogue and actions.
4. Separate Google Flow visual prompts for each scene.
5. Character consistency descriptions.
6. A natural ending and relevant call to action.

Make the story emotionally engaging and appropriate for the requested
duration. Avoid misleading insurance claims or guaranteed financial
outcomes. Keep the output practical for a beginner using Google Flow
and CapCut.
`;

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          input: prompt,
          max_output_tokens: 2500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data.error?.message);

      return res.status(502).json({
        error: "AI generation failed. Check your API access and billing."
      });
    }

    const text = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    if (!text) {
      return res.status(502).json({
        error: "The AI returned no text. Please try again."
      });
    }

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Generation request failed:", error.message);

    return res.status(500).json({
      error: "Unable to contact the AI service."
    });
  }
}
