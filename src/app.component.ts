import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService, PromptSection } from './services/gemini.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ProGuideComponent } from './pro-guide/pro-guide.component';

type FrameworkType = 'cinematic' | 'articulated' | 'photoreal' | 'pro-guide' | 'logo-reveal';
export type CoPilotFramework = 'cinematic' | 'articulated' | 'photoreal';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ProGuideComponent]
})
export class AppComponent {
  private readonly geminiService = inject(GeminiService);
  private readonly sanitizer = inject(DomSanitizer);

  activeFramework = signal<FrameworkType>('cinematic');
  outputType = signal<'video' | 'image'>('video');
  subject = signal('');
  isLoading = signal(false);
  error = signal<string | null>(null);
  generatedPrompt = signal<string | null>(null);
  copyButtonText = signal('Copy to Clipboard');
  outputViewMode = signal<'text' | 'json'>('text');

  // Workspace signals
  isGeneratingImage = signal(false);
  imageGenerationError = signal<string | null>(null);
  generatedImageUrl = signal<SafeUrl | null>(null);
  isUpscalingImage = signal(false);
  upscaleImageError = signal<string | null>(null);

  // New signals for image options
  imageModel = signal<'nano' | 'ultra'>('ultra');
  imageAspectRatio = signal<string>('1:1');
  readonly aspectRatios = ['1:1', '4:3', '16:9', '3:4', '9:16'];

  // New signals for advanced controls
  showAdvanced = signal(false);
  selectedCameraShots = signal<string[]>([]);
  promptFormat = signal<'text' | 'json'>('json');

  // New signals for Logo Reveal
  uploadedLogo = signal<File | null>(null);
  uploadedLogoPreview = signal<string | null>(null);
  logoRevealOutput = signal<string | null>(null);

  // New signals for AI Co-pilot
  aiCoPilotEnabled = signal(false);
  coPilotOutput = signal<string | null>(null);
  
  readonly cameraShots = [
    { name: 'Aerial Shot (Helicopter Shot, Drone Shot)', description: 'A shot taken from high above to show expansive views.' },
    { name: 'Arc Shot', description: 'Camera moves in a curved path around the subject for dynamic interest.' },
    { name: 'Bird\'s Eye View (Overhead Shot, Top Shot)', description: 'Camera is positioned directly above the subject for a top-down view.' },
    { name: 'Close-Up Shot (CU)', description: 'Focuses on a specific part, like a face, to capture detailed expressions.' },
    { name: 'Cowboy Shot (American Shot)', description: 'Frames subject from mid-thigh up, showing body language and props.' },
    { name: 'Crab Shot', description: 'Sideways tracking movement where the camera moves laterally.' },
    { name: 'Crane Shot (Jib Shot)', description: 'Camera on a crane for smooth vertical, horizontal, and arc movements.' },
    { name: 'Cutaway Shot', description: 'Cuts from main action to something else, then back.' },
    { name: 'Deep Focus Shot', description: 'Everything from foreground to background is in sharp focus.' },
    { name: 'Dolly Shot', description: 'Camera moves on a wheeled platform toward, away from, or alongside the subject.' },
    { name: 'Dolly Zoom Shot (Vertigo Effect, Zolly)', description: 'Camera dollies and zooms in opposite directions, distorting the background.' },
    { name: 'Dutch Angle (Dutch Tilt, Canted Angle)', description: 'Camera is tilted to create a disorienting, skewed perspective.' },
    { name: 'Establishing Shot', description: 'Wide shot that shows the location and context of a scene.' },
    { name: 'Extreme Close-Up (ECU, Choker Shot)', description: 'Very tight shot showing minute details, like eyes or mouth.' },
    { name: 'Extreme Long Shot (Extreme Wide Shot, EWS)', description: 'Very wide shot where the subject appears small in their environment.' },
    { name: 'Full Shot (Wide Shot of Character)', description: 'Shows the entire subject from head to toe.' },
    { name: 'Handheld Shot', description: 'Camera held by operator, creating a natural, energetic feel.' },
    { name: 'High Angle Shot', description: 'Camera looks down on the subject, making them seem vulnerable.' },
    { name: 'Insert Shot', description: 'Close-up that focuses on a specific detail, like hands or an object.' },
    { name: 'Long Shot (Wide Shot, WS, LS)', description: 'Shows the subject in their environment with surrounding space.' },
    { name: 'Low Angle Shot', description: 'Camera looks up at the subject, making them seem powerful.' },
    { name: 'Master Shot', description: 'Captures an entire scene\'s action in one continuous take.' },
    { name: 'Medium Close-Up (MCU)', description: 'Frames the subject from chest up for expressions with context.' },
    { name: 'Medium Shot (MS, Waist Shot)', description: 'Shows subject from waist up, balancing detail and context.' },
    { name: 'Medium Wide Shot (Medium Long Shot, MLS)', description: 'Shows subject from knees up, providing more environment.' },
    { name: 'Over-the-Shoulder Shot (OTS)', description: 'Positioned behind one character looking at another, used in dialogue.' },
    { name: 'Pan Shot (Panning)', description: 'Horizontal camera movement from a fixed position.' },
    { name: 'Pedestal Shot (Boom Up/Down)', description: 'Vertical camera movement where the entire camera moves up or down.' },
    { name: 'Point of View Shot (POV Shot)', description: 'Shows what a character is seeing from their perspective.' },
    { name: 'Pull Focus (Rack Focus)', description: 'Shifts focus from one subject to another in the same shot.' },
    { name: 'Pull Out (Pull Back Shot)', description: 'Camera moves backward away from the subject, revealing context.' },
    { name: 'Push In (Push Shot)', description: 'Camera moves forward toward the subject, creating intensity.' },
    { name: 'Shallow Focus Shot (Shallow DOF)', description: 'Only the subject is in focus, blurring the background to isolate them.' },
    { name: 'Snorricam Shot (Body-Mounted Camera)', description: 'Camera attached to the actor, keeping them centered as they move.' },
    { name: 'Static Shot (Fixed Shot, Locked Shot)', description: 'Camera remains completely stationary, emphasizing action within the frame.' },
    { name: 'Steadicam Shot (Stabilized Shot)', description: 'Camera on a stabilizer for smooth, handheld-like movement.' },
    { name: 'Tilt Shot (Tilting)', description: 'Vertical camera movement where the camera pivots up or down.' },
    { name: 'Tilt-Shift Shot', description: 'Uses a special lens to create selective focus, often miniaturizing scenes.' },
    { name: 'Tracking Shot (Following Shot)', description: 'Camera follows the subject\'s movement, typically parallel to them.' },
    { name: 'Truck Shot (Trucking)', description: 'Camera moves laterally left or right on a fixed point.' },
    { name: 'Two Shot', description: 'Shot featuring two subjects in the frame, showing their relationship.' },
    { name: 'Whip Pan (Swish Pan)', description: 'Extremely fast horizontal pan creating motion blur, used for transitions.' },
    { name: 'Whip Tilt (Swish Tilt)', description: 'Extremely fast vertical tilt creating motion blur.' },
    { name: 'Wire Shot (Cable Cam Shot)', description: 'Camera moves on cables for smooth aerial movements.' },
    { name: 'Zoom Shot', description: 'Changes focal length to make subject appear closer or further away.' },
  ];


  promptSections = computed<PromptSection[]>(() => {
    const jsonString = this.generatedPrompt();
    if (!jsonString) {
      return [];
    }

    try {
      const jsonObj = JSON.parse(jsonString);
      const sections: PromptSection[] = Object.entries(jsonObj).map(([key, value]) => {
        const title = key
          .replace(/_/g, ' ')
          .replace(/\b\w/g, char => char.toUpperCase());
        return {
          title: title.toUpperCase(),
          content: value as string
        };
      });
      return sections;
    } catch (e) {
      console.error("Failed to parse JSON prompt", e);
      return [{ title: 'Generated Content', content: jsonString }];
    }
  });

  jsonPrompt = computed(() => {
    const jsonString = this.generatedPrompt();
    if (!jsonString) {
      return null;
    }
    try {
      const jsonObj = JSON.parse(jsonString);
      return JSON.stringify(jsonObj, null, 2);
    } catch (e) {
      return jsonString;
    }
  });

  logoRevealJson = computed(() => {
    const jsonString = this.logoRevealOutput();
    if (!jsonString) return null;
    try {
        const jsonObj = JSON.parse(jsonString);
        return JSON.stringify(jsonObj, null, 2);
    } catch (e) {
        return jsonString; // return raw string if not valid JSON
    }
  });

  coPilotJson = computed(() => {
    const jsonString = this.coPilotOutput();
    if (!jsonString) return null;
    try {
        const jsonObj = JSON.parse(jsonString);
        return JSON.stringify(jsonObj, null, 2);
    } catch (e) {
        return jsonString; // return raw string if not valid JSON
    }
  });

  activePromptSections = computed<PromptSection[]>(() => {
    return this.promptSections();
  });


  selectFramework(framework: FrameworkType): void {
    this.activeFramework.set(framework);
    this.generatedPrompt.set(null);
    this.coPilotOutput.set(null); // Clear co-pilot output
    this.error.set(null);
    this.outputViewMode.set('text');
    this.clearWorkspace();
    this.showAdvanced.set(false);
    this.selectedCameraShots.set([]);
    this.uploadedLogo.set(null);
    this.uploadedLogoPreview.set(null);
    this.logoRevealOutput.set(null);
  }
  
  selectOutputType(type: 'video' | 'image'): void {
    this.outputType.set(type);
  }

  updateSubject(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.subject.set(input.value);
  }
  
  private clearWorkspace(): void {
    this.generatedImageUrl.set(null);
    this.imageGenerationError.set(null);
    this.isUpscalingImage.set(false);
    this.upscaleImageError.set(null);
  }

  toggleCameraShot(shotName: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.selectedCameraShots.update(shots => {
      if (isChecked) {
        if (!shots.includes(shotName)) {
          return [...shots, shotName];
        }
        return shots;
      } else {
        return shots.filter(s => s !== shotName);
      }
    });
  }

  async onGenerate(): Promise<void> {
    if (!this.subject().trim() || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.generatedPrompt.set(null);
    this.coPilotOutput.set(null);
    this.outputViewMode.set('text');
    this.clearWorkspace();

    try {
      const activeFramework = this.activeFramework();
      if (activeFramework === 'cinematic' || activeFramework === 'articulated' || activeFramework === 'photoreal') {
        const format = this.promptFormat();
        if (this.aiCoPilotEnabled()) {
          const result = await this.geminiService.generateWithCoPilot(this.subject(), activeFramework as CoPilotFramework, this.cameraShots, format);
          this.coPilotOutput.set(result);
        } else {
          const outputType = this.outputType();
          const subject = this.subject();
          const cameraShots = this.showAdvanced() ? this.selectedCameraShots() : [];

          let promptGenerator: Promise<string> | undefined;

          if (activeFramework === 'cinematic') {
            promptGenerator = this.geminiService.generateCinematicPrompt(subject, outputType, cameraShots, format);
          } else if (activeFramework === 'articulated') {
            promptGenerator = this.geminiService.generateArticulatedPrompt(subject, outputType, cameraShots, format);
          } else if (activeFramework === 'photoreal') {
            promptGenerator = this.geminiService.generatePhotorealPrompt(subject, outputType, cameraShots, format);
          }
          
          if (promptGenerator) {
              const result = await promptGenerator;
              this.generatedPrompt.set(result);
          }
        }
      }
    } catch (e) {
      this.error.set('An error occurred while generating the prompt. Please try again.');
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onGenerateImage(): Promise<void> {
    const prompt = this.activePromptSections().map(s => s.content).join(' ');
    if (!prompt || this.isGeneratingImage()) return;

    this.isGeneratingImage.set(true);
    this.imageGenerationError.set(null);
    this.generatedImageUrl.set(null);
    this.upscaleImageError.set(null);

    try {
      const base64Bytes = await this.geminiService.generateImage(prompt, this.imageAspectRatio());
      const imageUrl = 'data:image/png;base64,' + base64Bytes;
      this.generatedImageUrl.set(this.sanitizer.bypassSecurityTrustUrl(imageUrl));
    } catch (e) {
      this.imageGenerationError.set('Failed to generate image. Please try again.');
      console.error(e);
    } finally {
      this.isGeneratingImage.set(false);
    }
  }

  async onUpscaleImage(): Promise<void> {
    const prompt = this.activePromptSections().map(s => s.content).join(' ');
    if (!prompt || this.isUpscalingImage() || !this.generatedImageUrl()) return;

    this.isUpscalingImage.set(true);
    this.upscaleImageError.set(null);
    this.imageGenerationError.set(null);

    const upscalePrompt = `Upscale the following concept to ultra-high resolution, 4K, photorealistic quality with maximum detail and sharp focus. The original prompt was: ${prompt}`;

    try {
        const base64Bytes = await this.geminiService.generateImage(upscalePrompt, this.imageAspectRatio());
        const imageUrl = 'data:image/png;base64,' + base64Bytes;
        this.generatedImageUrl.set(this.sanitizer.bypassSecurityTrustUrl(imageUrl));
    } catch (e) {
        this.upscaleImageError.set('Failed to upscale image. Please try again.');
        console.error(e);
    } finally {
        this.isUpscalingImage.set(false);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.generatedImageUrl.set(this.sanitizer.bypassSecurityTrustUrl(result));
        this.imageGenerationError.set(null);
      };
      reader.readAsDataURL(file);
    }
  }

  onLogoFileSelected(event: Event): void {
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
      this.uploadedLogo.set(file);
      this.logoRevealOutput.set(null); // Clear previous results
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedLogoPreview.set(e.target?.result as string);
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
        // remove data:mime/type;base64, part
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  }

  async onGenerateLogoReveal(): Promise<void> {
    const logoFile = this.uploadedLogo();
    if (!logoFile || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.logoRevealOutput.set(null);

    try {
      const base64 = await this.fileToBase64(logoFile);
      const result = await this.geminiService.generateLogoRevealPrompt(base64, logoFile.type, logoFile.name);
      this.logoRevealOutput.set(result);
    } catch (e) {
      this.error.set('An error occurred while generating the logo reveal prompt.');
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }


  copyToClipboard(): void {
    let textToCopy: string | null = null;

    if (this.activeFramework() === 'logo-reveal') {
        textToCopy = this.logoRevealJson();
    } else if (this.aiCoPilotEnabled()) {
        textToCopy = this.coPilotOutput(); // coPilotOutput can be text or json string now
        if (this.promptFormat() === 'json') {
          textToCopy = this.coPilotJson();
        }
    } else {
        if (this.promptFormat() === 'text' || this.outputViewMode() === 'text') {
            textToCopy = this.promptSections().map(s => `${s.title}:\n${s.content}`).join('\n\n');
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
