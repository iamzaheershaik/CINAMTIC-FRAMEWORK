import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { CoPilotFramework } from '../app.component';

export interface PromptSection {
  title: string;
  content: string;
}

export interface AudioInputs {
  mood: string;
  sfx: string;
  music: string;
}

const cinematicSchema = {
  type: Type.OBJECT,
  properties: {
    context_foundation: { type: Type.STRING, description: "The 'why': Intent, audience, emotional goal, genre." },
    immersive_scene_setup: { type: Type.STRING, description: "The environment: Location, time, weather, atmosphere." },
    narrative_subject_definition: { type: Type.STRING, description: "All subjects: Appearance, clothing, props, expressions." },
    energetic_action_choreography: { type: Type.STRING, description: "Movement: Actions, transitions, pacing." },
    mechanical_camera_direction: { type: Type.STRING, description: "Camera work: Shot types, movements, angles, lens." },
    atmospheric_lighting_design: { type: Type.STRING, description: "Mood with light: Sources, color, contrast, shadows." },
    tonal_audio_architecture: { type: Type.STRING, description: "The soundscape: Dialogue, SFX, music, ambient." },
    integrated_style_palette: { type: Type.STRING, description: "The visual aesthetic: Color palette, style, texture." },
    calibrated_output_specifications: { type: Type.STRING, description: "Technical requirements: Duration (must be 8-10s), resolution, fps, aspect ratio." },
    enhancement_modifiers: { type: Type.STRING, description: "Optional: Can contain Emphasis Controller (+), Constraint Limiter (-), or Style Adapter (~)." },
    negative_prompt: { type: Type.STRING, description: "Based on the generated prompt, list elements to avoid: e.g., bad lighting, shaky cam, poor composition, inconsistent style." }
  },
  required: [
    'context_foundation', 'immersive_scene_setup', 'narrative_subject_definition',
    'energetic_action_choreography', 'mechanical_camera_direction', 'atmospheric_lighting_design',
    'tonal_audio_architecture', 'integrated_style_palette', 'calibrated_output_specifications',
    'enhancement_modifiers', 'negative_prompt'
  ]
};

const articulatedSchema = {
  type: Type.OBJECT,
  properties: {
      aesthetic_foundation_layer: { type: Type.STRING, description: "Visual design language and artistic style (e.g., 2D, 3D, anime, realistic), color theory, shape language, texture approach." },
      rhythmic_timing_architecture: { type: Type.STRING, description: "Musical timing and pacing (e.g., Frame rates, beat synchronization, pause timing, acceleration curves, slow-in/slow-out)." },
      temporal_motion_dynamics: { type: Type.STRING, description: "Movement through time with physics accuracy (e.g., Squash/stretch ratios, anticipation timing, follow-through duration, overlapping action)." },
      immersive_character_psychology: { type: Type.STRING, description: "Character personality through movement and expression (e.g., Personality traits in motion, emotional states, gesture vocabulary, micro-expressions)." },
      cinematic_staging_mastery: { type: Type.STRING, description: "Direct viewer attention through compositional control (e.g., Camera choreography, depth of field, scene composition, visual hierarchy)." },
      unity_consistency_engine: { type: Type.STRING, description: "Maintain visual and narrative coherence across sequences (e.g., Character model sheets, environment continuity, lighting consistency, style maintenance)." },
      life_infused_motion_principles: { type: Type.STRING, description: "Inject organic life into every movement (e.g., Secondary animation, overlapping action, natural arcs, weight distribution)." },
      atmospheric_environment_design: { type: Type.STRING, description: "Create immersive worlds that support character performance (e.g., Environmental storytelling, weather effects, atmospheric perspective, mood lighting)." },
      technical_excellence_optimization: { type: Type.STRING, description: "Professional-quality output specifications (e.g., Resolution, fps, codec, aspect ratio, color space)." },
      emotional_narrative_threading: { type: Type.STRING, description: "Embed storytelling structure into animation flow (e.g., Character arcs, emotional beats, narrative pacing, thematic elements)." },
      dynamic_enhancement_matrix: { type: Type.STRING, description: "Apply advanced animation techniques and effects (e.g., Special effects, motion blur, particle systems, advanced lighting)." },
      enhancement_multipliers: { type: Type.STRING, description: "Optional: Can contain Style Catalyst (×), Physics Amplifier (+), Emotional Resonator (~), or Platform Optimizer (→)." },
      negative_prompt: { type: Type.STRING, description: "Based on the generated animation prompt, list elements to avoid: e.g., stiff movement, lifeless characters, inconsistent physics, poor timing." }
  },
  required: [
      'aesthetic_foundation_layer', 'rhythmic_timing_architecture', 'temporal_motion_dynamics',
      'immersive_character_psychology', 'cinematic_staging_mastery', 'unity_consistency_engine',
      'life_infused_motion_principles', 'atmospheric_environment_design', 'technical_excellence_optimization',
      'emotional_narrative_threading', 'dynamic_enhancement_matrix', 'enhancement_multipliers', 'negative_prompt'
  ]
};

const photorealSchema = {
  type: Type.OBJECT,
  properties: {
    product_essence_and_branding: { type: Type.STRING, description: "The product's core identity: Brand, key features, target audience." },
    core_concept_and_narrative: { type: Type.STRING, description: "The single-sentence story or big idea of the commercial." },
    hyper_realistic_product_visualization: { type: Type.STRING, description: "Materiality and micro-details: Textures, reflections, seams, imperfections for realism." },
    studio_lighting_and_cinematography: { type: Type.STRING, description: "The look: Key/fill/rim lights, HDRI, softboxes, macro shots, slow pans, rack focus." },
    dynamic_cgi_environment: { type: Type.STRING, description: "The setting: Abstract studio, real-world location, surreal landscape, atmospheric effects." },
    physics_based_animation_and_simulation: { type: Type.STRING, description: "All motion: Elegant rotations, satisfying assembly, fluid/particle/cloth simulations." },
    sound_design_and_foley: { type: Type.STRING, description: "The audio experience: Crisp product sounds, immersive SFX, and a suitable music score." },
    post_production_and_color_grade: { type: Type.STRING, description: "The final polish: Color palette, motion blur, glow, bloom, and overall cinematic look." },
    render_engine_specifications: { type: Type.STRING, description: "Technical details: Path-traced rendering style, 4K resolution, 30/60fps, aspect ratio." },
    brand_call_to_action: { type: Type.STRING, description: "The marketing goal: On-screen text, logo placement, and tagline." },
    negative_prompt: { type: Type.STRING, description: "Based on the generated CGI prompt, list elements to avoid for achieving photorealism: e.g., plastic-looking textures, unrealistic reflections, poor physics, flat lighting, uncanny valley." }
  },
  required: [
    'product_essence_and_branding', 'core_concept_and_narrative', 'hyper_realistic_product_visualization',
    'studio_lighting_and_cinematography', 'dynamic_cgi_environment', 'physics_based_animation_and_simulation',
    'sound_design_and_foley', 'post_production_and_color_grade', 'render_engine_specifications', 'brand_call_to_action',
    'negative_prompt'
  ]
};

const storyboardSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      shot_number: { type: Type.NUMBER, description: "The sequential number of the shot." },
      shot_description: { type: Type.STRING, description: "A detailed description of the shot, including subject, action, camera work, and environment." },
      transition_to_next: { type: Type.STRING, description: "A description of the cinematic transition to the next shot (e.g., 'Cut to:', 'Fade to black', 'Wipe left'). For the last shot, this can be 'End scene.'." }
    },
    required: ['shot_number', 'shot_description', 'transition_to_next']
  }
};

const characterPacketSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "The character's name or title." },
    physical_description: { type: Type.STRING, description: "Exhaustive details of appearance: age, build, ethnicity, hair, eyes, facial features, distinguishing marks." },
    wardrobe_style: { type: Type.STRING, description: "Specific clothing items, fabrics, colors, and overall style. Include accessories and footwear." },
    personality_and_mannerisms: { type: Type.STRING, description: "Core personality traits and how they manifest in posture, expression, and movement." },
    signature_prop: { type: Type.STRING, description: "An object the character is frequently associated with. Can be null if not applicable." }
  },
  required: ['name', 'physical_description', 'wardrobe_style', 'personality_and_mannerisms', 'signature_prop']
};


@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private readonly ai: GoogleGenAI;
  private readonly apiKey: string;

  constructor() {
    this.apiKey = process.env.API_KEY;
    if (!this.apiKey) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async generateTransformationPrompt(source: string, target: string): Promise<string> {
    const model = 'gemini-2.5-flash';

    const masterPrompt = `
You are an expert AI video prompt engineer specializing in complex visual transformations. Your task is to generate a single, clear, and concise plain text prompt that describes a seamless and visually stunning transformation from a source subject to a target subject.

**Checklist for Transformation Prompt Generation:**
1.  **Analyze Source & Target:** Clearly establish the starting appearance of the source subject and the final form of the target.
2.  **Visualize the Mid-point:** Describe the critical mid-transformation phase. What does the blending of source and target look like? Is it organic, mechanical, magical?
3.  **Detail the Transition:** Articulate the transformation's dynamics. Is it rapid and explosive, or slow and elegant? Describe key visual effects (e.g., shimmering energy, shifting metal plates, growing fur).
4.  **Define the Environment:** Briefly describe how the environment reacts to the transformation (e.g., ground cracking, lights flickering, wind swirling).
5.  **Set the Cinematic Tone:** Specify camera work (e.g., 'slow push-in', 'dynamic arc shot') and lighting that enhance the drama of the moment.
6.  **Validate Prompt:** Before finalizing, internally review the prompt for clarity, safety, and ambiguity. Ensure it's creative and directly usable by an AI video model. If it fails validation, self-correct and regenerate.

**Request:**
Generate a single, coherent, plain text prompt for an AI video model based on the following transformation:

- **Source Subject:** "${source}"
- **Target Subject:** "${target}"

**Output Format:**
- A single plain text string.
- Do NOT use JSON or markdown.
- The prompt should be a descriptive paragraph, ready for an AI video generator.
`;

    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: masterPrompt,
        config: {
            temperature: 0.7,
            topP: 0.95
        }
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error calling Gemini API for transformation prompt:', error);
      throw new Error('Failed to generate transformation prompt from Gemini API.');
    }
  }

  async generateWithCoPilot(subject: string, framework: CoPilotFramework, cameraShots: {name: string, description: string}[], format: 'text' | 'json'): Promise<string> {
    const model = 'gemini-2.5-flash';
    
    const coPilotSchema = {
      type: Type.OBJECT,
      properties: {
        aiCoPilotEnabled: { type: Type.BOOLEAN },
        framework: { type: Type.STRING },
        originalPrompt: { type: Type.STRING },
        outputPrompt: { 
          type: Type.STRING, 
          description: "An extremely concise, expertly crafted, and optimized version of the prompt, using powerful single words to maximize impact." 
        },
        cameraSettings: {
          type: Type.OBJECT,
          description: "An object containing the camera shots and settings automatically selected by the AI.",
          properties: {
             selected_shots: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of the exact camera shot names selected by the AI."
             },
             rationale: {
                type: Type.STRING,
                description: "A brief justification for why these specific shots were chosen for the given prompt."
             }
          },
          required: ['selected_shots', 'rationale']
        },
        error: { type: Type.STRING, description: "Error details if the prompt is invalid, otherwise it MUST be null." }
      },
      required: ['aiCoPilotEnabled', 'framework', 'originalPrompt', 'outputPrompt', 'cameraSettings', 'error']
    };
    
    const availableCameraShots = cameraShots.map(s => s.name.split(' (')[0]);

    let masterPrompt: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let config: any;

    if (format === 'json') {
        masterPrompt = `
You are an AI Co-pilot for a professional prompt engineer. Your task is to analyze a user's prompt, automatically select the best camera controls, and generate an optimized, concise output prompt.

**Process:**
1.  **Validate Input:** Analyze the user's 'originalPrompt'. If it's invalid, nonsensical, or too vague to process, set a descriptive error message in the 'error' field and stop. Otherwise, set 'error' to null.
2.  **Select Camera Shots:** Based on the 'originalPrompt', choose the most advanced and appropriate camera shots from the provided list. You must select between 2 and 5 shots that will create the most dynamic and professional result.
3.  **Generate Rationale:** Briefly explain why you chose those specific camera shots in the 'cameraSettings.rationale' field.
4.  **Generate Optimized Prompt:** Create a new 'outputPrompt'. This must be an extremely concise, expertly crafted version of the original, using powerful single words or very short phrases to maximize impact and reduce length.
5.  **Format Output:** Return a single JSON object that strictly adheres to the provided schema. The 'aiCoPilotEnabled' field must be true. The 'framework' field must be '${framework}'. The 'originalPrompt' must be the user's provided subject.

**Available Camera Shots (Choose from this list only):**
${availableCameraShots.join(', ')}

**User's Original Prompt:** "${subject}"
`;
        config = {
            temperature: 0.4,
            topP: 0.95,
            responseMimeType: "application/json",
            responseSchema: coPilotSchema
        };
    } else { // format === 'text'
        masterPrompt = `
You are an AI Co-pilot for a professional prompt engineer. Your task is to analyze a user's prompt, automatically select the best camera controls, and generate an optimized, concise output prompt as formatted text.

**Process:**
1.  **Validate Input:** Analyze the user's 'originalPrompt'. If it's invalid, nonsensical, or too vague, just output an error message.
2.  **Select Camera Shots:** Based on the 'originalPrompt', choose between 2 and 5 of the most advanced and appropriate camera shots from the provided list.
3.  **Generate Rationale:** Briefly explain why you chose those specific camera shots.
4.  **Generate Optimized Prompt:** Create a new optimized prompt. This must be an extremely concise, expertly crafted version of the original. Use powerful, evocative single words or very short phrases where possible to maximize impact.
5.  **Format Output:** Return a single formatted text block. Use markdown-style headers for each section: 'OPTIMIZED PROMPT:', 'SELECTED CAMERA SHOTS:', and 'RATIONALE:'. Do NOT output JSON.

**Available Camera Shots (Choose from this list only):**
${availableCameraShots.join(', ')}

**User's Original Prompt:** "${subject}"
`;
        config = {
            temperature: 0.4,
            topP: 0.95
        };
    }

    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: masterPrompt,
        config: config
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error calling Gemini API for AI Co-pilot:', error);
      throw new Error('Failed to generate prompt from Gemini API with AI Co-pilot.');
    }
  }

  async generateLogoRevealPrompt(logoImageBase64: string, mimeType: string, filename: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    
    const logoRevealSchema = {
      type: Type.OBJECT,
      properties: {
        uploaded_logo_filename: { 
          type: Type.STRING,
          description: "The filename of the uploaded logo image."
        },
        logo_reveal_prompt: { 
          type: Type.STRING,
          description: "The primary, high-quality prompt for the logo reveal animation."
        },
        prompts: {
          type: Type.ARRAY,
          description: "An array of alternative prompt variations. Can be empty.",
          items: {
            type: Type.STRING,
          }
        },
        error: { 
          type: Type.STRING,
          description: "An error message if image validation fails, otherwise it must be null."
        }
      },
      required: ['uploaded_logo_filename', 'logo_reveal_prompt', 'error']
    };

    const masterPrompt = `
You are a world-class motion graphics designer specializing in cinematic logo reveals.
Your task is to generate a professional animation prompt based on the provided logo image.

Checklist:
1.  **Analyze the Logo:** Examine the logo's shapes, colors, and overall style (e.g., minimalist, complex, modern, classic).
2.  **Generate a Core Prompt:** Create one high-quality, detailed prompt for a professional, cinematic logo reveal animation. The style should be inspired by sophisticated motion graphics created in Blender and After Effects. The prompt must describe the visual effects, camera movements, lighting, and sound design that would bring the logo to life.
3.  **Generate Variations (Optional):** If artistically relevant, create 1-2 alternative prompt variations exploring different creative directions (e.g., one dark and moody, one bright and energetic). Add these to the "prompts" array.
4.  **Format Output:** Return the response as a single, strictly formatted JSON object adhering to the provided schema.

Output Rules:
- The \`uploaded_logo_filename\` must be the original filename of the logo.
- The \`logo_reveal_prompt\` must be your best, primary suggestion.
- The \`prompts\` field is an array for additional variations. If you only produce one main prompt, you can still include it as the single item in this array.
- For the \`error\` field, if there are no problems, you MUST return the JSON value \`null\`. Do not use an empty string. If there's an issue with the image (e.g., it's not a logo), provide a descriptive error message.

**Filename:** "${filename}"
`;

    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: logoImageBase64,
      },
    };

    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: { parts: [ {text: masterPrompt}, imagePart ] },
        config: {
            temperature: 0.6,
            topP: 0.95,
            responseMimeType: "application/json",
            responseSchema: logoRevealSchema
        }
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error calling Gemini API for logo reveal:', error);
      throw new Error('Failed to generate logo reveal prompt from Gemini API.');
    }
  }

  async generateCinematicPrompt(subject: string, outputType: 'video' | 'image', cameraShots: string[], format: 'text' | 'json', styleImage?: { base64: string, mimeType: string }, audioInputs?: AudioInputs): Promise<string> {
    return this.generateFullPrompt(subject, outputType, cameraShots, format, 'cinematic', cinematicSchema, styleImage, audioInputs);
  }

  async generateArticulatedPrompt(subject: string, outputType: 'video' | 'image', cameraShots: string[], format: 'text' | 'json', styleImage?: { base64: string, mimeType: string }, audioInputs?: AudioInputs): Promise<string> {
    return this.generateFullPrompt(subject, outputType, cameraShots, format, 'articulated', articulatedSchema, styleImage, audioInputs);
  }

  async generatePhotorealPrompt(subject: string, outputType: 'video' | 'image', cameraShots: string[], format: 'text' | 'json', styleImage?: { base64: string, mimeType: string }, audioInputs?: AudioInputs): Promise<string> {
    return this.generateFullPrompt(subject, outputType, cameraShots, format, 'photoreal', photorealSchema, styleImage, audioInputs);
  }

  private async generateFullPrompt(subject: string, outputType: 'video' | 'image', cameraShots: string[], format: 'text' | 'json', framework: 'cinematic' | 'articulated' | 'photoreal', schema: object, styleImage?: { base64: string, mimeType: string }, audioInputs?: AudioInputs): Promise<string> {
    const model = 'gemini-2.5-flash';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contents: any[] = [];
    
    let cameraField = 'mechanical_camera_direction';
    if (framework === 'articulated') cameraField = 'cinematic_staging_mastery';
    if (framework === 'photoreal') cameraField = 'studio_lighting_and_cinematography';

    const cameraShotsInstruction = cameraShots.length > 0
    ? `\nCrucially, you MUST incorporate the following specific camera shots into the '${cameraField}' section. Blend them naturally with other camera work descriptions: ${cameraShots.join(', ')}.`
    : '';
    
    const styleInstruction = styleImage 
    ? "\nAdditionally, you MUST analyze the provided style reference image. Infuse its aesthetic (color palette, lighting, texture, mood) into every aspect of the generated prompt, especially the 'integrated_style_palette' and 'atmospheric_lighting_design' sections."
    : '';

    let audioInstruction = '';
    if (audioInputs) {
        const audioParts = [];
        if (audioInputs.mood) audioParts.push(`Mood: ${audioInputs.mood}`);
        if (audioInputs.sfx) audioParts.push(`Key Sound Effects: ${audioInputs.sfx}`);
        if (audioInputs.music) audioParts.push(`Musical Style: ${audioInputs.music}`);
        if (audioParts.length > 0) {
            audioInstruction = `\nFor the audio section, you MUST specifically incorporate the following user-defined elements: ${audioParts.join(', ')}.`;
        }
    }

    let masterPrompt: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let config: any;

    if (format === 'json') {
        masterPrompt = `
You are an expert AI prompt engineer specializing in the ${framework.toUpperCase()} framework. Your task is to take a simple subject and expand it into a detailed, high-quality prompt for AI generation.
The final output will be an **${outputType.toUpperCase()}**. All sections must be filled out with this target medium in mind.
- If the target is a VIDEO, describe movement, duration, sound, and camera choreography. The 'calibrated_output_specifications' must specify a duration between 8 and 10 seconds.
- If the target is an IMAGE, describe a single, dynamic, frozen moment. Focus on composition, lighting, and detail. Replace concepts of duration and sound with descriptions of implied motion and mood.
${cameraShotsInstruction}
${styleInstruction}
${audioInstruction}
Generate a JSON object that adheres to the provided schema. The JSON keys must be in snake_case.
Fill out a value for every required property in the schema.
Be creative, detailed, and evocative.
Finally, based on the detailed prompt you've created, generate a 'negative_prompt' that lists potential pitfalls or unwanted elements to ensure a high-quality result.

**Subject:** "${subject}"
`;
        config = {
            temperature: 0.5,
            topP: 0.95,
            responseMimeType: "application/json",
            responseSchema: schema
        };
    } else { // format === 'text'
        masterPrompt = `
You are an expert AI prompt engineer specializing in the ${framework.toUpperCase()} framework. Your task is to take a simple subject and expand it into a detailed, high-quality prompt for AI generation.
The final output will be an **${outputType.toUpperCase()}**.
- If the target is a VIDEO, describe movement, duration, sound, and camera choreography. The duration must be between 8 and 10 seconds.
- If the target is an IMAGE, describe a single, dynamic, frozen moment. Focus on composition, lighting, and detail.
${cameraShotsInstruction}
${styleInstruction}
${audioInstruction}
Generate a formatted plain text output. For each component of the ${framework.toUpperCase()} framework, use the component name as a capitalized header (e.g., 'CONTEXT FOUNDATION:') followed by the content. Do NOT output a JSON object.
Finally, based on the detailed prompt you've created, generate a 'NEGATIVE PROMPT' section that lists potential pitfalls or unwanted elements to ensure a high-quality result.

**Subject:** "${subject}"
`;
        config = {
            temperature: 0.5,
            topP: 0.95
        };
    }

    contents.push({ text: masterPrompt });
    if (styleImage) {
        contents.push({ inlineData: { mimeType: styleImage.mimeType, data: styleImage.base64 } });
    }

    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: { parts: contents },
        config: config
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to generate prompt from Gemini API.');
    }
  }

  async refinePrompt(originalSubject: string, currentPrompt: string, instruction: string, framework: 'cinematic' | 'articulated' | 'photoreal', format: 'text' | 'json'): Promise<string> {
    const model = 'gemini-2.5-flash';
    let schema: object;
    let schemaName: string;

    if (framework === 'cinematic') {
        schema = cinematicSchema;
        schemaName = 'CINEMATIC';
    } else if (framework === 'articulated') {
        schema = articulatedSchema;
        schemaName = 'ARTICULATED';
    } else {
        schema = photorealSchema;
        schemaName = 'PHOTOREAL';
    }
    
    let masterPrompt: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let config: any;

    if (format === 'json') {
        masterPrompt = `
You are an AI prompt engineer. You previously generated a prompt for a user. Now, they have provided a refinement instruction.
Your task is to regenerate the entire prompt, incorporating the user's changes, while maintaining the original structure and detail.

- **Original Subject:** "${originalSubject}"
- **Previously Generated Prompt (JSON):** \`\`\`json\n${currentPrompt}\n\`\`\`
- **User's Refinement Instruction:** "${instruction}"

**Action:**
Regenerate the complete JSON object according to the ${schemaName} schema. The new prompt must seamlessly integrate the refinement instruction. Do not just describe the change; output the full, updated JSON prompt.
`;
        config = {
            temperature: 0.5,
            topP: 0.95,
            responseMimeType: "application/json",
            responseSchema: schema
        };
    } else { // format === 'text'
        masterPrompt = `
You are an AI prompt engineer. You previously generated a prompt for a user. Now, they have provided a refinement instruction.
Your task is to regenerate the entire prompt, incorporating the user's changes, while maintaining the original structure and detail.

- **Original Subject:** "${originalSubject}"
- **Previously Generated Prompt (Text):** \`\`\`\n${currentPrompt}\n\`\`\`
- **User's Refinement Instruction:** "${instruction}"

**Action:**
Regenerate the complete formatted plain text prompt according to the ${schemaName} framework. The new prompt must seamlessly integrate the refinement instruction. Do not just describe the change; output the full, updated text prompt with capitalized headers for each section.
`;
        config = {
            temperature: 0.5,
            topP: 0.95
        };
    }

    try {
        const response = await this.ai.models.generateContent({
            model: model,
            contents: masterPrompt,
            config: config
        });
        return response.text.trim();
    } catch (error) {
        console.error('Error calling Gemini API for refinement:', error);
        throw new Error('Failed to refine prompt from Gemini API.');
    }
  }

  async generateStoryboard(scene: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    const masterPrompt = `
You are a storyboard artist and screenwriter. Based on the following scene description, generate a sequence of 3-5 cinematic shots. For each shot, provide a detailed description and a transition to the next shot. Output as a JSON array that strictly adheres to the provided schema.

**Scene Description:** "${scene}"
`;
    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: masterPrompt,
        config: {
            temperature: 0.6,
            topP: 0.95,
            responseMimeType: "application/json",
            responseSchema: storyboardSchema
        }
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error calling Gemini API for storyboard:', error);
      throw new Error('Failed to generate storyboard from Gemini API.');
    }
  }

  async generateCharacterPacket(description: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    const masterPrompt = `
You are a character designer and concept artist. Based on the user's description, create a detailed Character Consistency Packet. This packet should be a JSON object containing exhaustive details that can be used to maintain character consistency across multiple AI-generated scenes. Fill out every field in the provided schema with rich, descriptive detail.

**Character Description:** "${description}"
`;
    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: masterPrompt,
        config: {
            temperature: 0.5,
            topP: 0.95,
            responseMimeType: "application/json",
            responseSchema: characterPacketSchema
        }
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error calling Gemini API for character packet:', error);
      throw new Error('Failed to generate character packet from Gemini API.');
    }
  }

  async generateImage(prompt: string, aspectRatio: string): Promise<string> {
    try {
      const response = await this.ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio
        },
      });

      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error('API did not return any images.');
      }

      return response.generatedImages[0].image.imageBytes;
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image from Gemini API.');
    }
  }
}
