import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService, PromptSection } from './services/gemini.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class AppComponent {
  private readonly geminiService = inject(GeminiService);

  activeFramework = signal<'cinematic' | 'articulated'>('cinematic');
  subject = signal('');
  isLoading = signal(false);
  error = signal<string | null>(null);
  generatedPrompt = signal<string | null>(null);
  copyButtonText = signal('Copy to Clipboard');

  promptSections = computed<PromptSection[]>(() => {
    const prompt = this.generatedPrompt();
    if (!prompt) {
      return [];
    }

    const cinematicTitles = [
      'CONTEXT FOUNDATION', 'IMMERSIVE SCENE SETUP', 'NARRATIVE SUBJECT DEFINITION',
      'ENERGETIC ACTION CHOREOGRAPHY', 'MECHANICAL CAMERA DIRECTION', 'ATMOSPHERIC LIGHTING DESIGN',
      'TONAL AUDIO ARCHITECTURE', 'INTEGRATED STYLE PALETTE', 'CALIBRATED OUTPUT SPECIFICATIONS',
      'ENHANCEMENT MODIFIERS', 'EMPHASIS CONTROLLER', 'CONSTRAINT LIMITER', 'STYLE ADAPTER'
    ];
    
    const articulatedTitles = [
      'AESTHETIC FOUNDATION LAYER', 'RHYTHMIC TIMING ARCHITECTURE', 'TEMPORAL MOTION DYNAMICS',
      'IMMERSIVE CHARACTER PSYCHOLOGY', 'CINEMATIC STAGING MASTERY', 'UNITY CONSISTENCY ENGINE',
      'LIFE-INFUSED MOTION PRINCIPLES', 'ATMOSPHERIC ENVIRONMENT DESIGN', 'TECHNICAL EXCELLENCE OPTIMIZATION',
      'EMOTIONAL NARRATIVE THREADING', 'DYNAMIC ENHANCEMENT MATRIX',
      'STYLE CATALYST', 'PHYSICS AMPLIFIER', 'EMOTIONAL RESONATOR', 'PLATFORM OPTIMIZER'
    ];

    const titles = this.activeFramework() === 'cinematic' ? cinematicTitles : articulatedTitles;
    
    // A regex to split the text by the titles, case-insensitive, followed by a colon.
    const regex = new RegExp(`^(${titles.join('|')}):`, 'gim');
    const lines = prompt.split('\n').filter(line => line.trim() !== '');
    
    const sections: PromptSection[] = [];
    let currentSection: PromptSection | null = null;

    for (const line of lines) {
      const match = line.match(regex);
      if (match) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: match[0].replace(':', '').trim(),
          content: line.substring(match[0].length).trim()
        };
      } else if (currentSection) {
        currentSection.content += '\n' + line.trim();
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }
    
    if (sections.length === 0 && prompt) {
        return [{ title: 'Generated Prompt', content: prompt }];
    }

    return sections;
  });

  selectFramework(framework: 'cinematic' | 'articulated'): void {
    this.activeFramework.set(framework);
    this.generatedPrompt.set(null);
    this.error.set(null);
  }

  updateSubject(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.subject.set(input.value);
  }

  async onGenerate(): Promise<void> {
    if (!this.subject().trim() || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.generatedPrompt.set(null);

    try {
      const promptGenerator = this.activeFramework() === 'cinematic'
        ? this.geminiService.generateCinematicPrompt(this.subject())
        : this.geminiService.generateArticulatedPrompt(this.subject());
      
      const result = await promptGenerator;
      this.generatedPrompt.set(result);
    } catch (e) {
      this.error.set('An error occurred while generating the prompt. Please try again.');
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  copyToClipboard(): void {
    const promptText = this.generatedPrompt();
    if (promptText) {
      navigator.clipboard.writeText(promptText).then(() => {
        this.copyButtonText.set('Copied!');
        setTimeout(() => this.copyButtonText.set('Copy to Clipboard'), 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        this.copyButtonText.set('Copy Failed');
         setTimeout(() => this.copyButtonText.set('Copy to Clipboard'), 2000);
      });
    }
  }
}