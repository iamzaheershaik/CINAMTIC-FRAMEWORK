
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

    const titles = [
      'CONTEXT FOUNDATION', 'IMMERSIVE SCENE SETUP', 'NARRATIVE SUBJECT DEFINITION',
      'ENERGETIC ACTION CHOREOGRAPHY', 'MECHANICAL CAMERA DIRECTION', 'ATMOSPHERIC LIGHTING DESIGN',
      'TONAL AUDIO ARCHITECTURE', 'INTEGRATED STYLE PALETTE', 'CALIBRATED OUTPUT SPECIFICATIONS',
      'ENHANCEMENT MODIFIERS', 'EMPHASIS CONTROLLER', 'CONSTRAINT LIMITER', 'STYLE ADAPTER'
    ];
    
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
      const result = await this.geminiService.generateCinematicPrompt(this.subject());
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
