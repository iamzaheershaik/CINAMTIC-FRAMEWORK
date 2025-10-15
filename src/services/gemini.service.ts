import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

export interface PromptSection {
  title: string;
  content: string;
}

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

  async generateCinematicPrompt(subject: string, outputType: 'video' | 'image', cameraShots: string[]): Promise<string> {
    const model = 'gemini-2.5-flash';
    
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
    
    const cameraShotsInstruction = cameraShots.length > 0
    ? `\nCrucially, you MUST incorporate the following specific camera shots into the 'mechanical_camera_direction' section. Blend them naturally with other camera work descriptions: ${cameraShots.join(', ')}.`
    : '';

    const masterPrompt = `
You are an expert AI prompt engineer. Your task is to take a simple subject and expand it into a detailed, high-quality prompt for AI generation using the CINEMATIC framework.
The final output will be an **${outputType.toUpperCase()}**. All sections must be filled out with this target medium in mind.
- If the target is a VIDEO, describe movement, duration, sound, and camera choreography. The 'calibrated_output_specifications' must specify a duration between 8 and 10 seconds.
- If the target is an IMAGE, describe a single, dynamic, frozen moment. Focus on composition, lighting, and detail. Replace concepts of duration and sound with descriptions of implied motion and mood.
${cameraShotsInstruction}
Generate a JSON object that adheres to the provided schema. The JSON keys must be in snake_case.
Fill out a value for every required property in the schema.
Be creative, detailed, and evocative.
Finally, based on the detailed prompt you've created, generate a 'negative_prompt' that lists potential pitfalls or unwanted elements to ensure a high-quality result.

**Subject:** "${subject}"
`;

    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: masterPrompt,
        config: {
            temperature: 0.5,
            topP: 0.95,
            responseMimeType: "application/json",
            responseSchema: cinematicSchema
        }
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to generate prompt from Gemini API.');
    }
  }

  async generateArticulatedPrompt(subject: string, outputType: 'video' | 'image', cameraShots: string[]): Promise<string> {
    const model = 'gemini-2.5-flash';
    
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

    const cameraShotsInstruction = cameraShots.length > 0
    ? `\nCrucially, you MUST incorporate the following specific camera shots into the 'cinematic_staging_mastery' section. Blend them naturally with other camera work descriptions: ${cameraShots.join(', ')}.`
    : '';

    const masterPrompt = `
You are an expert AI animation prompt engineer. Your task is to take a simple subject and expand it into a detailed, high-quality animation prompt using the ARTICULATED framework.
The final output will be an **${outputType.toUpperCase()}**. All sections must be filled out with this target medium in mind.
- If the target is a VIDEO, describe fluid animation, timing, and character psychology through movement over time.
- If the target is an IMAGE, describe a single, perfectly captured frame of animation, emphasizing dynamic posing, expressive character states, and storytelling within a still composition.
${cameraShotsInstruction}
Generate a JSON object that adheres to the provided schema. The JSON keys must be in snake_case.
Fill out a value for every required property in the schema.
Be creative, detailed, and evocative, focusing on principles of animation.
Finally, based on the detailed prompt you've created, generate a 'negative_prompt' that lists potential pitfalls or unwanted elements to ensure a high-quality result.

**Subject:** "${subject}"
`;

    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: masterPrompt,
        config: {
            temperature: 0.5,
            topP: 0.95,
            responseMimeType: "application/json",
            responseSchema: articulatedSchema
        }
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to generate prompt from Gemini API.');
    }
  }

  async generatePhotorealPrompt(subject: string, outputType: 'video' | 'image', cameraShots: string[]): Promise<string> {
    const model = 'gemini-2.5-flash';
    
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

    const cameraShotsInstruction = cameraShots.length > 0
    ? `\nCrucially, you MUST incorporate the following specific camera shots into the 'studio_lighting_and_cinematography' section. Blend them naturally with other camera work descriptions: ${cameraShots.join(', ')}.`
    : '';

    const masterPrompt = `
You are an expert creative director for high-end CGI product commercials. Your task is to take a product subject and expand it into a detailed, photorealistic 3D commercial concept using the PHOTOREAL framework.
The final output will be an **${outputType.toUpperCase()}**. All sections must be filled out with this target medium in mind.
- If the target is a VIDEO, describe elegant motion, physics simulations, and a narrative that unfolds over a few seconds.
- If the target is an IMAGE, describe a single, hyper-detailed hero shot of the product, focusing on materials, lighting, and an impossibly perfect moment (e.g., a liquid splash frozen in time).
${cameraShotsInstruction}
Generate a JSON object that adheres to the provided schema. The JSON keys must be in snake_case.
Fill out a value for every required property in the schema. The output must be hyper-detailed, sophisticated, and visually stunning, focusing on achieving ultimate realism and a premium feel.
Finally, based on the detailed prompt you've created, generate a 'negative_prompt' that lists potential pitfalls or unwanted elements to ensure a high-quality result.

**Product Subject:** "${subject}"
`;

    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: masterPrompt,
        config: {
            temperature: 0.5,
            topP: 0.95,
            responseMimeType: "application/json",
            responseSchema: photorealSchema
        }
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to generate prompt from Gemini API.');
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

  async generateVideo(prompt: string, progressCallback: (message: string) => void): Promise<string> {
    const progressMessages = [
      "The digital film is rolling! Rendering in progress...",
      "AI is directing your scene. Please hold on...",
      "Adding the final touches and cinematic polish...",
      "Almost there! Preparing your video for viewing."
    ];
    let messageIndex = 0;

    try {
      progressCallback('Initializing video generation... This may take a few minutes.');
      let operation = await this.ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: prompt,
        config: {
          numberOfVideos: 1
        }
      });
      
      progressCallback(progressMessages[messageIndex++]);

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        progressCallback(progressMessages[messageIndex++ % progressMessages.length]);
        operation = await this.ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) {
        throw new Error("Video generation finished, but no download link was provided.");
      }

      progressCallback("Generation complete! Downloading video...");
      const response = await fetch(`${downloadLink}&key=${this.apiKey}`);
      if (!response.ok) {
        throw new Error(`Failed to download video file. Status: ${response.status}`);
      }
      
      const blob = await response.blob();
      return URL.createObjectURL(blob);

    } catch (error) {
      console.error('Error generating video:', error);
      throw new Error('Failed to generate video from Gemini API.');
    }
  }
}
