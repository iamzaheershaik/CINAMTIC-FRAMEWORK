import { Component, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService, PromptSection } from '../services/gemini.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

type CoPilotOutput = {
  aiCoPilotEnabled: boolean;
  framework: string;
  originalPrompt: string;
  outputPrompt: string;
  cameraSettings: {
    selected_shots: string[];
    rationale: string;
  };
  negative_prompt_analysis: {
    rationale: string;
    negative_prompts: string[];
  };
  error: string | null;
};

@Component({
  selector: 'app-myth-prompt',
  templateUrl: './myth-prompt.component.html',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MythPromptComponent {
  private readonly geminiService = inject(GeminiService);
  private readonly sanitizer = inject(DomSanitizer);

  subject = signal('');
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  generatedPrompt = signal<string | null>(null);
  coPilotOutput = signal<string | null>(null);
  
  aiCoPilotEnabled = signal(false);
  concisePromptEnabled = signal(false);
  
  styleReferenceImage = signal<File | null>(null);
  styleReferenceImagePreview = signal<SafeUrl | null>(null);
  
  copyButtonText = signal('Copy to Clipboard');
  outputViewMode = signal<'text' | 'json'>('text');

  promptSections = computed<PromptSection[]>(() => {
    const jsonString = this.generatedPrompt();
    if (!jsonString) return [];

    if (this.concisePromptEnabled()) {
      return [{ title: 'CONCISE MYTHIC PROMPT (1900 CHARACTERS)', content: jsonString }];
    }

    try {
      const jsonObj = JSON.parse(jsonString);
      return Object.entries(jsonObj).map(([key, value]) => ({
        title: key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()),
        content: value as string
      }));
    } catch (e) {
      return [{ title: 'Generated Prompt', content: jsonString }];
    }
  });

  jsonPrompt = computed(() => {
    const jsonString = this.generatedPrompt();
    if (!jsonString) return null;
    try {
      const jsonObj = JSON.parse(jsonString);
      return JSON.stringify(jsonObj, null, 2);
    } catch (e) {
      return jsonString;
    }
  });
  
  parsedCoPilotOutput = computed<CoPilotOutput | null>(() => {
    const output = this.coPilotOutput();
    if (output) {
      try {
        const parsed = JSON.parse(output);
        if (parsed && parsed.negative_prompt_analysis) {
          return parsed as CoPilotOutput;
        }
        return null;
      } catch (e) {
        console.error('Failed to parse CoPilot output:', e);
        return null;
      }
    }
    return null;
  });

  autoResizeTextarea(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    // Reset height to allow shrinking
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  updateSubject(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.subject.set(input.value);
    this.autoResizeTextarea(event);
  }

  async onGenerate(): Promise<void> {
    if (!this.subject().trim() || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.generatedPrompt.set(null);
    this.coPilotOutput.set(null);

    try {
        let styleImage: { base64: string, mimeType: string } | undefined;
        if (this.styleReferenceImage()) {
            styleImage = {
                base64: await this.fileToBase64(this.styleReferenceImage() as File),
                mimeType: (this.styleReferenceImage() as File).type
            };
        }

        if (this.aiCoPilotEnabled()) {
            const result = await this.geminiService.generateMythPromptWithCoPilot(this.subject(), styleImage);
            this.coPilotOutput.set(result);
        } else {
            const result = await this.geminiService.generateMythPrompt(this.subject(), 'json', styleImage, this.concisePromptEnabled());
            this.generatedPrompt.set(result);
        }
    } catch (e) {
      this.error.set('An error occurred while generating the prompt. Please try again.');
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  onStyleFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.error.set('Invalid file type. Please upload an image.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.error.set('File is too large. Please upload an image under 5MB.');
        return;
      }
      this.error.set(null);
      this.styleReferenceImage.set(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.styleReferenceImagePreview.set(this.sanitizer.bypassSecurityTrustUrl(e.target?.result as string));
      };
      reader.readAsDataURL(file);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  }

  copyToClipboard(): void {
    let textToCopy: string | null = null;

    if (this.coPilotOutput()) {
      const parsed = this.parsedCoPilotOutput();
      textToCopy = parsed ? JSON.stringify(parsed, null, 2) : this.coPilotOutput();
    } else if (this.generatedPrompt()) {
      if (this.concisePromptEnabled() || this.outputViewMode() === 'text') {
        textToCopy = this.promptSections().map(s => `**${s.title}:**\n${s.content}`).join('\n\n');
      } else {
        textToCopy = this.jsonPrompt();
      }
    }
      
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
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