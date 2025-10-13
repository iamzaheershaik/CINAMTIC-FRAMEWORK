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
}