import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

export interface PromptSection {
  title: string;
  content: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private readonly ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateCinematicPrompt(subject: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    
    const masterPrompt = `
You are an expert AI video prompt engineer. Your task is to take a simple subject and expand it into a detailed, high-quality video prompt using the CINEMATIC framework.
Ensure you generate content for every single core layer of the framework (C-I-N-E-M-A-T-I-C). Also include at least one Enhancement Modifier.
The output should be a single block of text, with each framework layer on a new line, formatted exactly like this:
FRAMEWORK LAYER: [Generated content for the layer]

**THE CINEMATIC FRAMEWORK:**

*   **C - Context Foundation:** Define the "why." (Intent, audience, emotional goal, genre).
*   **I - Immersive Scene Setup:** Establish the environment. (Location, time, weather, atmosphere).
*   **N - Narrative Subject Definition:** Describe all subjects. (Appearance, clothing, props, expressions).
*   **E - Energetic Action Choreography:** Define movement. (Actions, transitions, pacing).
*   **M - Mechanical Camera Direction:** Specify camera work. (Shot types, movements, angles, lens).
*   **A - Atmospheric Lighting Design:** Control the mood with light. (Sources, color, contrast, shadows).
*   **T - Tonal Audio Architecture:** Design the soundscape. (Dialogue, SFX, music, ambient).
*   **I - Integrated Style Palette:** Unify the visual aesthetic. (Color palette, style, texture).
*   **C - Calibrated Output Specifications:** Define technical requirements. The duration must always be between 8 and 10 seconds. (Duration, resolution, fps, aspect ratio).

**Enhancement Modifiers:**
*   **Emphasis Controller (+):** Amplifies specific layers.
*   **Constraint Limiter (-):** Restricts certain elements.
*   **Style Adapter (~):** Applies genre or platform optimizations.

---

Now, generate a full CINEMATIC prompt for the following subject. Be creative, detailed, and evocative.

**Subject:** "${subject}"
`;

    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: masterPrompt,
        config: {
            temperature: 0.8,
            topP: 0.95,
        }
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to generate prompt from Gemini API.');
    }
  }

  async generateArticulatedPrompt(subject: string): Promise<string> {
    const model = 'gemini-2.5-flash';
    
    const masterPrompt = `
You are an expert AI animation prompt engineer. Your task is to take a simple subject and expand it into a detailed, high-quality animation prompt using the ARTICULATED framework.
Ensure you generate content for every single core layer of the framework (A-R-T-I-C-U-L-A-T-E-D). Also include at least one Enhancement Multiplier.
The output should be a single block of text, with each framework layer on a new line, formatted exactly like this:
FRAMEWORK LAYER NAME: [Generated content for the layer]

**THE ARTICULATED FRAMEWORK:**

**Core Animation Layers (A-R-T-I-C-U-L-A-T-E-D):**
*   **A - Aesthetic Foundation Layer:** Define the visual design language and artistic style (e.g., 2D, 3D, anime, realistic), color theory, shape language, texture approach.
*   **R - Rhythmic Timing Architecture:** Control the musical timing and pacing (e.g., Frame rates, beat synchronization, pause timing, acceleration curves, slow-in/slow-out).
*   **T - Temporal Motion Dynamics:** Orchestrate movement through time with physics accuracy (e.g., Squash/stretch ratios, anticipation timing, follow-through duration, overlapping action).
*   **I - Immersive Character Psychology:** Define character personality through movement and expression (e.g., Personality traits in motion, emotional states, gesture vocabulary, micro-expressions).
*   **C - Cinematic Staging Mastery:** Direct viewer attention through compositional control (e.g., Camera choreography, depth of field, scene composition, visual hierarchy).
*   **U - Unity Consistency Engine:** Maintain visual and narrative coherence across sequences (e.g., Character model sheets, environment continuity, lighting consistency, style maintenance).
*   **L - Life-Infused Motion Principles:** Inject organic life into every movement (e.g., Secondary animation, overlapping action, natural arcs, weight distribution).
*   **A - Atmospheric Environment Design:** Create immersive worlds that support character performance (e.g., Environmental storytelling, weather effects, atmospheric perspective, mood lighting).
*   **T - Technical Excellence Optimization:** Ensure professional-quality output specifications (e.g., Resolution, fps, codec, aspect ratio, color space).
*   **E - Emotional Narrative Threading:** Embed storytelling structure into animation flow (e.g., Character arcs, emotional beats, narrative pacing, thematic elements).
*   **D - Dynamic Enhancement Matrix:** Apply advanced animation techniques and effects (e.g., Special effects, motion blur, particle systems, advanced lighting).

**Enhancement Multipliers:**
*   **Style Catalyst (×):** Applies genre-specific animation conventions and techniques.
*   **Physics Amplifier (+):** Enhances or reduces realistic physics simulation.
*   **Emotional Resonator (~):** Amplifies emotional expression through animation techniques.
*   **Platform Optimizer (→):** Adapts output for specific platforms and viewing contexts.

---

Now, generate a full ARTICULATED prompt for the following subject. Be creative, detailed, and evocative, focusing on principles of animation.

**Subject:** "${subject}"
`;

    try {
      const response = await this.ai.models.generateContent({
        model: model,
        contents: masterPrompt,
        config: {
            temperature: 0.8,
            topP: 0.95,
        }
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to generate prompt from Gemini API.');
    }
  }
}