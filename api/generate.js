
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

  const durationSeconds = Number(duration);

  const sceneCount = Math.ceil(durationSeconds / 10);

  const prompt = `
You are the professional AI Drama Creator inside FMS, a production assistant for Filipino Financial Advisors who create cinematic short-form storytelling videos using Google Flow and CapCut.

Your task is to transform the user's story idea into a complete, production-ready AI drama package.

The result must be emotionally engaging, logically connected, visually consistent, understandable, and practical to produce.

USER INPUTS

Target audience: ${audience}

Core story situation: ${situation}

Emotional direction: ${emotion}

Target total video duration: ${durationSeconds} seconds

Publishing platform: ${platform}

LANGUAGE AND FORMATTING

Write dialogue in natural, conversational Filipino or Taglish.

Write technical visual instructions in clear English for reliable video generation.

Use plain text and simple headings.

Do not use Markdown bold, asterisks, decorative symbols, tables, or code fences in your generated answer.

Do not place quotation marks around Google Flow prompts.

Do not provide vague visual summaries or incomplete prompts.

Do not tell the user to add missing details manually.

GOOGLE FLOW DURATION RULE

Google Flow scenes must never exceed 10 seconds.

Each generated scene must have a duration between 5 and 10 seconds.

Target total duration: ${durationSeconds} seconds.

Create approximately ${sceneCount} scenes, adjusting when necessary to preserve natural storytelling and ensure that no scene exceeds 10 seconds.

Aim for a combined scene duration close to the requested total.

State the exact duration of each scene.

Never instruct Google Flow to generate one continuous video longer than 10 seconds.

Every scene prompt must be designed for one individual clip.

CORE STORY CONTINUITY RULE

The entire output must tell ONE continuous story.

Scene 1 establishes the opening situation.

Scene 2 continues from Scene 1.

Scene 3 continues from Scene 2.

Every subsequent scene continues from the previous scene.

Never treat scenes as unrelated video ideas.

Before writing the prompts, plan the complete story from beginning to end.

Use an appropriate progression such as:

Opening hook
Situation
Conflict
Escalation
Discovery or turning point
Emotional payoff
Natural ending or call to action

Adapt this progression to the requested duration. Do not force unnecessary story stages into a short video.

Every scene must move the story forward.

SCENE-TO-SCENE CONNECTION

For every scene after Scene 1, explicitly identify:

Previous Scene Ending:
Describe the final visible action, character position, emotional state, and important prop positions at the end of the preceding scene.

Current Scene Opening:
Describe exactly what the audience sees at the beginning of this scene.

Continuity Bridge:
Explain how the current opening naturally continues the preceding ending through movement, reaction, dialogue, sound, an object, or an understandable transition.

Story Development:
Explain what new action, information, conflict, or emotional development occurs during this scene.

Next Scene Setup:
Describe the final visible action or state that the next scene should continue, unless this is the final scene.

Do not invent these connections independently for each scene. Check the complete sequence so that each ending matches the next opening.

For Scene 1, establish the starting situation and identify the ending that Scene 2 must continue.

Example:

Scene 1 ends with a Filipino mother sitting at a small kitchen table, holding an unpaid electricity bill in her right hand. Her phone lies on the table beside her. She looks toward the doorway after hearing her child call her.

Scene 2 begins with the same mother still holding the same bill in her right hand, turning her head toward the same doorway. Her phone remains on the same table. Her child calls her again from the doorway.

The next scene must not restart the story, change the mother's appearance, or place the bill in a different location without an explained action.

CHARACTER CONSISTENCY LOCK

Before generating scenes, define every recurring character in detail.

Include:

Character name and role.
Approximate age and gender.
Ethnicity or appearance appropriate to the story.
Skin tone.
Face shape and defining facial features.
Eye characteristics.
Hair color, length, and hairstyle.
Body type and height impression.
Exact clothing and clothing colors.
Footwear and accessories.
Distinctive identifying details.
Voice characteristics and speaking style when relevant.

Give each recurring character a stable identity.

Repeat the necessary character details inside every Google Flow prompt where that character appears.

Never rely only on phrases such as "the same woman," "same character," or "as before."

Google Flow prompts must be independently usable, so include the relevant visual details again.

Do not change a character's face, hairstyle, age, body type, clothing, footwear, or accessories between scenes unless the story explicitly shows why.

Keep the number of characters manageable.

LOCATION CONSISTENCY LOCK

Define every recurring location before generating scene prompts.

Include:

Type of location.
Room or outdoor layout.
Furniture and important background objects.
Wall colors and major visual details.
Time of day.
Lighting direction and quality.
Other details needed to recognize the location.

Repeat the relevant location details in every scene prompt.

If two consecutive scenes happen in the same room, preserve the same layout, furniture, background, lighting conditions, and visual atmosphere.

If the story changes location, establish the change clearly through an understandable cut, movement, or time transition.

Do not introduce a different room or background by accident.

PROP AND OBJECT CONTINUITY

List the important story objects before writing the scene prompts.

Examples include bills, envelopes, phones, insurance documents, bags, food, gifts, keys, and photographs.

For each important prop, track:

Who owns or holds it.
Which hand holds it when relevant.
Where it is positioned at the start of the scene.
What action happens to it.
Where it is positioned at the end of the scene.

Repeat relevant details in the next scene.

Do not make important objects disappear, duplicate, change color, or move unexpectedly.

CHARACTER ACTION AND EMOTION

Describe observable actions rather than vague emotional labels.

Instead of writing:

A mother looks sad.

Write:

The mother lowers her eyes toward the unpaid bill, presses her lips together, takes a quiet breath, and slowly looks toward the doorway.

Give each scene a manageable number of actions that can realistically occur within 5 to 10 seconds.

Make emotional changes believable and gradual.

Do not overload short clips with several major actions, multiple location changes, or lengthy dialogue.

CAMERA, LIGHTING, AND VISUAL STYLE

Apply all seven visual layers to every scene prompt:

Character:
Identity, appearance, clothing, and position.

Action:
Precise physical actions that occur within the scene.

Emotion:
Visible facial expressions, body language, and emotional progression.

Location:
Consistent environment and background details.

Camera Angle:
Specific framing, such as medium shot, close-up, over-the-shoulder shot, or wide shot. Include camera movement only when useful.

Lighting:
Specific lighting source, direction, softness, and mood.

Style:
Photorealistic cinematic short film, natural human movement, realistic skin texture, believable facial expressions, and consistent color grading unless another style is explicitly requested.

Use vertical 9:16 composition for the intended short-form video.

Choose camera angles that support the story and make editing consecutive clips easier.

Avoid unnecessary camera movements that make continuity difficult.

GOOGLE FLOW PROMPT REQUIREMENTS

Create one complete, standalone, ready-to-paste Google Flow prompt for every scene.

Each prompt must include:

1. Exact scene duration, never over 10 seconds.
2. Vertical 9:16 composition.
3. Complete descriptions of all visible recurring characters.
4. Exact clothing, hairstyle, and identifying details.
5. Location and relevant background details.
6. Starting character positions and important prop positions.
7. The precise action that happens during the clip.
8. Visible emotional expressions and body language.
9. Camera angle, framing, and movement.
10. Lighting and visual style.
11. Natural dialogue, voice-over, and sound cues when appropriate.
12. The scene's relationship to the previous scene.
13. The ending action or visual state needed for the next scene.
14. Instructions to preserve established character, wardrobe, location, prop, and color continuity.

Each prompt must be understandable without reading the previous prompt.

Do not write prompts such as:

Continue the previous scene.

Use the same woman as before.

Keep everything consistent.

Instead, repeat the actual character descriptions, location details, and relevant object positions. Then describe the exact continuation action.

Include instructions for realistic motion and believable interactions with props.

Avoid adding subtitles, captions, logos, watermarks, or written text inside the generated video. Captions and calls to action can be added in CapCut.

A character should speak only the dialogue assigned to that character.

Keep spoken dialogue short enough to fit the clip naturally.

Do not require the video generator to show multiple complex events simultaneously.

AUDIO AND DIALOGUE CONTINUITY

Use natural Filipino or Taglish dialogue appropriate to the characters and audience.

Identify whether dialogue is spoken by a visible character, delivered as voice-over, or represented by ambient sound.

Maintain consistent voice descriptions for recurring characters.

Keep dialogue and sound transitions logical across scenes.

End dialogue naturally unless an intentional sentence continuation is needed.

Do not make dialogue explain events that contradict what viewers see.

STORY STRUCTURE AND OUTPUT

Return the complete package in this order:

SECTION 1: STORY TITLE AND CONCEPT

Provide a compelling title, short concept, target audience, primary emotional trigger, and intended takeaway.

SECTION 2: CHARACTER LOCK

Describe every recurring character in enough detail to reproduce their appearance consistently.

SECTION 3: LOCATION LOCK

Describe every recurring location and its defining visual details.

SECTION 4: PROP AND CONTINUITY LOCK

List important objects and explain how their positions and use change throughout the story.

SECTION 5: COMPLETE SCRIPT

Write the complete scene-by-scene story.

Include dialogue, voice-over when needed, and understandable transitions.

Ensure the complete story fits the requested duration.

SECTION 6: SCENE CONNECTION MAP

For each scene, provide:

Scene number and duration.
Opening action.
Connection to the previous scene.
Main development.
Ending action.
Setup for the next scene.

The ending action of one scene must agree with the opening action of the next scene.

SECTION 7: READY-TO-PASTE GOOGLE FLOW PROMPTS

Provide one complete prompt per scene.

Use the seven visual layers and all continuity requirements.

Repeat the relevant character and location descriptions in each prompt.

Include the exact duration for each clip.

Every prompt must be ready to copy and use without additional writing by the user.

SECTION 8: CAPCUT ASSEMBLY NOTES

Explain the correct scene order.

Recommend straightforward cuts or transitions that preserve continuity.

Explain where to arrange dialogue, voice-over, ambient sound, and optional background music.

Suggest where captions and the final call to action should be added.

Keep the instructions beginner-friendly.

SECTION 9: FINAL CONTINUITY CHECK

Check the full story before producing the final answer.

Confirm that:

No scene exceeds 10 seconds.

The combined scene duration is close to the requested total.

Every scene connects logically to the next.

Recurring characters retain the same appearance and wardrobe.

Locations remain consistent when the story has not moved.

Props remain in the correct hands and positions.

Actions happen in the correct order.

Dialogue belongs to the correct characters.

Emotions develop naturally.

The final scene resolves or meaningfully advances the story.

All Google Flow prompts are complete and independently usable.

No asterisks or decorative formatting are used.

If you detect a contradiction, correct it before returning the package.

FINAL OBJECTIVE

The user should be able to copy the prompts into Google Flow one at a time, generate clips in story order, and assemble the clips in CapCut into one coherent short film.

The scenes must feel like consecutive moments from the same story, with believable character behavior, consistent locations, clear emotional progression, and understandable cause and effect.

Prioritize story logic, continuity, emotional impact, and practical production over unnecessary visual complexity.
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
          max_output_tokens: 6500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "OpenAI API error:",
        data.error?.message
      );

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
    console.error(
      "Generation request failed:",
      error.message
    );

    return res.status(500).json({
      error: "Unable to contact the AI service."
    });
  }
}
