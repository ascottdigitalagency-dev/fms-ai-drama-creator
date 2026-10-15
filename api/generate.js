export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Only POST requests are allowed." });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OpenAI API key is not configured on the server." });
  }

  const body = req.body || {};
  const { audience, situation, emotion, duration, platform, stage, projectName, previousOutputs } = body;
  const allowedEmotions = ["Relatable", "Emotional", "Suspenseful", "Comedy"];
  const allowedDurations = ["15", "30", "60"];
  const allowedPlatforms = ["Facebook Reels", "TikTok", "YouTube Shorts"];
  const allowedStages = [
    "story", "script", "characters", "locations", "continuity", "shotPlan", "imagePrompts", "videoPrompts", "qualityCheck", "editingPlan"
  ];

  if (typeof audience !== "string" || !audience.trim() || audience.length > 200 ||
      typeof situation !== "string" || !situation.trim() || situation.length > 2000) {
    return res.status(400).json({ error: "Please provide a valid target audience and story situation." });
  }
  if (!allowedEmotions.includes(emotion) || !allowedDurations.includes(String(duration)) ||
      !allowedPlatforms.includes(platform) || !allowedStages.includes(stage)) {
    return res.status(400).json({ error: "Please select valid story options and a valid production stage." });
  }

  const durationSeconds = Number(duration);
  const sceneCount = Math.ceil(durationSeconds / 10);
  const stageNames = {
    story: "STAGE 1 — STORY CONCEPT",
    script: "STAGE 2 — SCRIPT AND TIMING",
    characters: "STAGE 3 — CHARACTER LOCK",
    locations: "STAGE 4 — LOCATION AND VISUAL STYLE LOCK",
    continuity: "STAGE 5 — CONTINUITY MAP",
    shotPlan: "STAGE 6 — CINEMATIC SHOT PLAN",
    imagePrompts: "STAGE 7 — FIRST-FRAME IMAGE PROMPTS",
    videoPrompts: "STAGE 8 — VIDEO GENERATION PROMPTS",
    qualityCheck: "STAGE 9 — QUALITY CONTROL CHECKLIST",
    editingPlan: "STAGE 10 — EDITING AND PUBLISHING PLAN"
  };

  const stageTasks = {
    story: `Create 3 distinct story concepts suitable for the user's audience and situation. For each: title, logline, opening hook, central conflict, emotional turning point, ending/payoff, intended takeaway, and why it may resonate. Then recommend one concept and explain briefly. Do not write the full production package yet.`,
    script: `Develop the approved/recommended concept into a complete scene-by-scene script. Target ${durationSeconds} seconds total. Google Flow clips must each be 5–10 seconds maximum. Use approximately ${sceneCount} clips, adjusting clip durations to total close to ${durationSeconds} seconds. State duration per scene, visible action, dialogue in natural Filipino/Taglish, sound, emotional beat, and transition/ending action. Dialogue must fit the clip. Keep the story continuous and realistic.`,
    characters: `Create a CHARACTER LOCK SHEET for every recurring character in the approved story. Include name/role, age range, skin tone, face shape, eyes, hair, body type, exact wardrobe/colors, footwear, accessories, distinguishing details, voice and speaking style. Include a concise reusable character-lock paragraph for each person. Identify which characters appear in each scene. Do not invent unrelated characters.`,
    locations: `Create a LOCATION AND VISUAL STYLE LOCK SHEET. Define each location's layout, dimensions/impression, walls, furniture, background objects, time of day, light direction/quality, atmosphere, palette, and recognizable anchors. Define a consistent cinematic visual style and vertical 9:16 framing. State which scenes occur at each location. Include reusable location descriptions.`,
    continuity: `Build a scene-by-scene CONTINUITY MAP. For every scene list: duration; opening frame; character positions and eyelines; screen direction; important prop owner/hand/position; action; camera axis; ending frame; and exact next-scene opening bridge. Enforce the 180-degree rule unless a deliberate axis-crossing shot is motivated and bridged. Preserve matching action, eyelines, wardrobe, location layout, lighting/time, and prop positions. Make every scene ending match the next scene's opening.`,
    shotPlan: `Create a production-ready SHOT PLAN for every scene. Include shot number, scene, purpose/story beat, shot size, camera angle, composition, camera movement, lens/look if useful, blocking, screen direction/eyeline, lighting source/direction/quality, foreground/background, action timing, sound/dialogue, continuity risks, and transition. Apply filmmaking fundamentals: composition and visual hierarchy; motivated camera movement; 180-degree rule; matching action; eyeline match; screen direction; blocking; light continuity; shot/reverse-shot where useful; pacing and visual storytelling. Keep each clip achievable within its duration.`,
    imagePrompts: `Write one complete, standalone FIRST-FRAME IMAGE GENERATION PROMPT for every shot/scene, intended to establish the correct starting frame before video generation. Repeat the full relevant character descriptions, exact clothing, location anchors, prop positions, camera angle/framing, composition, lighting, mood, photorealistic cinematic style, and vertical 9:16 format. The first frame must match the continuity map. Include a negative/avoid list for identity drift, extra fingers/limbs, duplicated people/props, incorrect text, inconsistent wardrobe, and unwanted subtitles/logos/watermarks. Do not write video motion instructions here.`,
    videoPrompts: `Write one complete, standalone VIDEO GENERATION PROMPT for each scene, using the approved story, character/location locks, continuity map, and shot plan. Every clip must be 5–10 seconds maximum, with exact duration and vertical 9:16 composition. Repeat relevant character, wardrobe, location, and prop details; describe the precise starting positions, one manageable continuous action, visible emotion/body language, camera framing/movement, lighting, sound/dialogue, and final state that sets up the next scene. Never say only “continue previous scene.” Do not add subtitles, captions, logos, watermarks, or arbitrary on-screen text.`,
    qualityCheck: `Create a practical PRE-GENERATION and POST-GENERATION quality-control checklist for this specific film. Include story logic, scene duration (never above 10 seconds), identity/wardrobe, location, props, blocking, 180-degree rule, eyelines, matching action, composition, lighting, natural motion, dialogue/audio, ending-to-opening continuity, prompt completeness, and editability. Define PASS, PASS WITH MINOR ISSUES, REVISE, and REGENERATE. Include a shot review template users can fill in after checking each generated clip. Do not claim to have inspected generated footage; assess only the provided written plan and identify what still needs visual review.`,
    editingPlan: `Create a beginner-friendly CapCut assembly and publishing plan. Give exact scene order, recommended cuts/transitions, pacing, dialogue/voice-over and ambient sound placement, music guidance, caption placement, color/brightness consistency checks, end card/soft CTA guidance, export settings suitable for ${platform}, and a final review checklist. Do not insert hard-selling insurance claims or promise financial outcomes. Keep the CTA appropriate to the story and audience.`
  };

  const prior = previousOutputs && typeof previousOutputs === "object" ? previousOutputs : {};
  const safePrior = Object.entries(prior)
    .filter(([key, value]) => allowedStages.includes(key) && typeof value === "string")
    .map(([key, value]) => `\n--- ${stageNames[key] || key} ---\n${value.slice(0, 6500)}`)
    .join("\n")
    .slice(-18000);

  const prompt = `You are the AI Short Film Director & Production System: a careful director, screenwriter, cinematographer, continuity supervisor, and production assistant. You guide a beginner through a staged workflow. You are not generating every production stage at once; complete only the requested stage below.

PROJECT BRIEF
Project name: ${typeof projectName === "string" ? projectName.slice(0, 120) : "Untitled Film"}
Target audience: ${audience}
Core story situation: ${situation}
Emotional direction: ${emotion}
Target total duration: ${durationSeconds} seconds
Publishing platform: ${platform}
Google Flow maximum clip duration: 10 seconds
Approximate number of clips: ${sceneCount}

DIRECTOR'S FUNDAMENTALS — APPLY THROUGHOUT
1. STORY BEFORE EFFECTS: clear want, relatable stakes, cause and effect, escalating conflict, earned emotional turn, meaningful payoff.
2. COMPOSITION: establish a clear subject and visual hierarchy; use headroom, look room, leading lines, foreground/background depth, and purposeful wide/medium/close shots.
3. CAMERA MOTIVATION: each shot size and movement must support story or emotion. Avoid decorative movement and impossible camera paths.
4. CONTINUITY: preserve screen direction, the 180-degree axis, eyelines, matching action, character positions, wardrobe, prop states, lighting direction, time of day, and geography. If intentionally crossing the axis, make the transition clear.
5. BLOCKING: describe where each person stands/sits, what they do, where they look, and how they move in a physically achievable way.
6. LIGHTING: specify motivated source, direction, softness, contrast, and mood; preserve it between shots in the same place/time.
7. EDITING RHYTHM: clips must have one primary beat and fit their duration. Let reactions breathe; cut on action or meaningful looks; avoid cramming multiple events into one clip.
8. VISUAL STORYTELLING: show emotion through observable facial expression, gesture, posture, pauses, and interaction with objects—not only labels such as “sad.”
9. PRODUCTION REALITY: keep characters, locations, and action manageable for AI video tools. Avoid unnecessary crowd scenes, complex hand interactions, and too many simultaneous actions.
10. OUTPUT QUALITY: be specific and practical. Never claim that a generated video has passed visual QC unless footage has actually been reviewed by a human.

LANGUAGE AND STYLE
Use natural, conversational Filipino/Taglish for dialogue. Use clear English for technical prompts. Use plain text headings and readable lists. Avoid Markdown tables and decorative symbols. Do not put quotation marks around prompts intended for Google Flow. Use vertical 9:16 framing unless the user explicitly requests otherwise. Do not request captions, subtitles, logos, or watermarks inside generated footage; these can be added during editing.

STAGE TO COMPLETE
${stageNames[stage]}

TASK
${stageTasks[stage]}

PREVIOUS APPROVED/GENERATED PROJECT MATERIAL
Use the material below as the source of truth. Do not contradict it. If a necessary detail is missing, make a sensible minimal choice and label it as an assumption rather than asking the user to fill in technical details.
${safePrior || "No previous stage output has been supplied. Work only on the current requested stage and make reasonable choices from the project brief."}

FINAL SELF-CHECK BEFORE RESPONDING
Check internal consistency, duration, continuity, natural dialogue, achievable action, and the specific requested stage. Do not generate later stages unless the current task explicitly requests them. Clearly flag assumptions and unresolved continuity risks.`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: prompt,
        max_output_tokens: stage === "videoPrompts" || stage === "imagePrompts" ? 7000 : 5000
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI API error:", data.error?.message || "Unknown error");
      return res.status(502).json({ error: "AI generation failed. Check API access, model availability, and billing." });
    }

    const text = (data.output || [])
      .flatMap(item => item.content || [])
      .filter(item => item.type === "output_text")
      .map(item => item.text)
      .join("\n");

    if (!text.trim()) {
      return res.status(502).json({ error: "The AI returned no text. Please try again." });
    }

    return res.status(200).json({ text, stage, stageTitle: stageNames[stage] });
  } catch (error) {
    console.error("Generation request failed:", error.message);
    return res.status(500).json({ error: "Unable to contact the AI service." });
  }
}
