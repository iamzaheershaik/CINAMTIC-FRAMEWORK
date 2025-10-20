import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService, MotionPromptParams, PromptSection, AudioInputs, ActionPromptParams } from './services/gemini.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ProGuideComponent } from './pro-guide/pro-guide.component';
import { MythPromptComponent } from './myth-prompt/myth-prompt.component';

type FrameworkType = 'cinematic' | 'articulated' | 'photoreal' | 'pro-guide' | 'logo-reveal' | 'transformation' | 'storyboard' | 'character' | 'motion' | 'action' | 'myth-prompt';
export type CoPilotFramework = 'cinematic' | 'articulated' | 'photoreal';

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
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ProGuideComponent, MythPromptComponent]
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
  
  parsedCoPilotOutput = computed<CoPilotOutput | null>(() => {
    const output = this.coPilotOutput();
    if (this.promptFormat() === 'json' && output) {
      try {
        const parsed = JSON.parse(output);
        // Basic validation that the new field exists before returning typed object
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

  // Signals for Transformation Framework
  sourceSubject = signal('');
  targetSubject = signal('');
  
  // New Signals for implemented features
  storyboardScene = signal('');
  storyboardOutput = signal<string | null>(null);
  characterDescription = signal('');
  characterPacket = signal<string | null>(null);
  styleReferenceImage = signal<File | null>(null);
  styleReferenceImagePreview = signal<string | null>(null);
  refinementInstruction = signal('');
  isRefining = signal(false);
  audioMood = signal('');
  audioSfx = signal('');
  audioMusic = signal('');
  concisePromptEnabled = signal(false);

  // Signals for Motion Framework
  motionSceneDescription = signal('');
  selectedMotionCategory = signal('');
  selectedMotionType = signal('');
  motionDuration = signal('5-second');
  motionCameraAngle = signal('eye-level');
  motionIntensity = signal('moderate');
  motionLighting = signal('natural lighting');
  motionQuality = signal('4K, cinematic');
  motionFrameRate = signal(24);
  motionSpeedRamp = signal({ start: '1.0x', end: '0.25x', point: '2s', curve: 'ease-in-out' });
  motionBulletTime = signal({ arc: '180 degrees', duration: '2 seconds' });
  motionDollyZoom = signal({ dolly: 'in', zoom: 'out', intensity: 'moderate' });
  motionParallax = signal({ layers: 4, separation: 'moderate' });
  motionTiltShift = signal({ angle: '0 degrees', blur: 'strong' });
  motionPromptOutput = signal<string | null>(null);

  // Signals for Action Framework
  showActionOptional = signal(false);
  actionNarrativeCoreGoal = signal('Recover stolen data drive');
  actionNarrativeCoreStakes = signal('The data exposes corporate corruption; if it gets to the press, the protagonist\'s whistleblower will be killed.');
  actionNarrativeCoreConsequence = signal('If the protagonist fails, the antagonist succeeds in silencing the whistleblower and covering their tracks.');
  actionProtagonistName = signal('Ethan Hunt');
  actionProtagonistTrait = signal('Resourceful');
  actionProtagonistFightStyle = signal('Improvisational Brawler');
  actionAntagonistName = signal('The White Widow');
  actionAntagonistTrait = signal('Graceful and Calculating');
  actionAntagonistFightStyle = signal('Martial Artist');
  actionRelationship = signal('Clash of opposing ideologies and past history.');
  actionSetting = signal('Abandoned oil rig');
  actionAtmosphere = signal('Stormy night, torrential rain, high winds, lightning flashes');
  actionKeyObjects = signal('crates, oil drums, spilled chemical containers');
  actionCameraAngle = signal('Low-angle for menace');
  actionLensChoice = signal('Telephoto for impact compression');
  actionLighting = signal('High-contrast chiaroscuro');
  actionOpeningRhythm = signal('Slow, tense build-up');
  actionClimaxRhythm = signal('Fast, frenetic cutting');
  actionTransitions = signal('quick cuts, handheld follow-moves');
  actionSpecialEffects = signal('slow-motion for key blows');
  actionAmbientSounds = signal('Howling wind, crashing waves, distant thunder');
  actionImpactSounds = signal('Squelching wet fabrics, dull thuds on armor, metallic clangs');
  actionSoundDesignNotes = signal('Delay explosion sounds to match visual delay for realism');
  actionTechnicalNotes = signal('Ensure all primary stunts are performed by the actors to maintain authenticity. Use a mix of wide and medium shots to establish geography before closing in for detail.');
  actionPromptOutput = signal<string | null>(null);

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

  readonly motionTaxonomy = [
    { category: 'Speed Variation', motions: [ { name: 'hyperspeed' }, { name: 'slow_motion' }, { name: 'speed_ramp' }, { name: 'time_lapse' }, { name: 'ultra_slow_motion' } ] },
    { category: 'Temporal & Directional', motions: [ { name: 'reverse' }, { name: 'freeze_frame' }, { name: 'bullet_time' }, { name: 'stop_motion' }, { name: 'boomerang' } ] },
    { category: 'Camera Movement', motions: [ { name: 'dolly_zoom' }, { name: 'push_in' }, { name: 'pull_out' }, { name: 'whip_pan' }, { name: 'camera_pan' }, { name: 'camera_tilt' }, { name: 'tracking_shot' }, { name: 'crab_shot' }, { name: 'orbit' } ] },
    { category: 'Depth & Perspective', motions: [ { name: 'parallax_motion' }, { name: 'ken_burns_effect' }, { name: 'tilt_shift' }, { name: 'zoom_blur' } ] },
    { category: 'Stylistic & Creative', motions: [ { name: 'glitch' }, { name: 'strobe' }, { name: 'jump_cut' }, { name: 'match_cut' }, { name: 'seamless_loop' } ] }
  ];

  availableMotions = computed(() => {
    const category = this.selectedMotionCategory();
    if (!category) return [];
    return this.motionTaxonomy.find(c => c.category === category)?.motions || [];
  });


  promptSections = computed<PromptSection[]>(() => {
    const jsonString = this.generatedPrompt();
    if (!jsonString) {
      return [];
    }

    if (this.activeFramework() === 'transformation') {
      return [{ title: 'TRANSFORMATION PROMPT', content: jsonString }];
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

  storyboardJson = computed(() => {
    const jsonString = this.storyboardOutput();
    if (!jsonString) return null;
    try {
        const jsonObj = JSON.parse(jsonString);
        return JSON.stringify(jsonObj, null, 2);
    } catch (e) {
        return jsonString;
    }
  });

  characterPacketJson = computed(() => {
    const jsonString = this.characterPacket();
    if (!jsonString) return null;
    try {
        const jsonObj = JSON.parse(jsonString);
        return JSON.stringify(jsonObj, null, 2);
    } catch (e) {
        return jsonString;
    }
  });

  actionPromptJson = computed(() => {
    const jsonString = this.actionPromptOutput();
    if (!jsonString) return null;
    try {
        const jsonObj = JSON.parse(jsonString);
        return JSON.stringify(jsonObj, null, 2);
    } catch (e) {
        return jsonString;
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
    this.sourceSubject.set('');
    this.targetSubject.set('');
    this.storyboardScene.set('');
    this.storyboardOutput.set(null);
    this.characterDescription.set('');
    this.characterPacket.set(null);
    this.styleReferenceImage.set(null);
    this.styleReferenceImagePreview.set(null);
    this.refinementInstruction.set('');
    this.motionSceneDescription.set('');
    this.selectedMotionCategory.set('');
    this.selectedMotionType.set('');
    this.motionPromptOutput.set(null);
    this.actionPromptOutput.set(null);
    this.showActionOptional.set(false);
    this.concisePromptEnabled.set(false);
  }
  
  selectOutputType(type: 'video' | 'image'): void {
    this.outputType.set(type);
  }

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

  updateSourceSubject(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.sourceSubject.set(input.value);
    this.autoResizeTextarea(event);
  }

  updateTargetSubject(event: Event): void {
    const input = event.target as HTMLTextAreaElement;
    this.targetSubject.set(input.value);
    this.autoResizeTextarea(event);
  }

  updateStoryboardScene(event: Event): void {
    this.storyboardScene.set((event.target as HTMLTextAreaElement).value);
    this.autoResizeTextarea(event);
  }

  updateCharacterDescription(event: Event): void {
    this.characterDescription.set((event.target as HTMLTextAreaElement).value);
    this.autoResizeTextarea(event);
  }

  updateMotionSceneDescription(event: Event): void {
    this.motionSceneDescription.set((event.target as HTMLTextAreaElement).value);
    this.autoResizeTextarea(event);
  }

  updateRefinementInstruction(event: Event): void {
    this.refinementInstruction.set((event.target as HTMLTextAreaElement).value);
    this.autoResizeTextarea(event);
  }
  
  updateActionNarrativeCoreGoal(event: Event): void {
    this.actionNarrativeCoreGoal.set((event.target as HTMLTextAreaElement).value);
    this.autoResizeTextarea(event);
  }

  updateActionNarrativeCoreStakes(event: Event): void {
    this.actionNarrativeCoreStakes.set((event.target as HTMLTextAreaElement).value);
    this.autoResizeTextarea(event);
  }

  updateActionNarrativeCoreConsequence(event: Event): void {
    this.actionNarrativeCoreConsequence.set((event.target as HTMLTextAreaElement).value);
    this.autoResizeTextarea(event);
  }

  updateActionRelationship(event: Event): void {
    this.actionRelationship.set((event.target as HTMLTextAreaElement).value);
    this.autoResizeTextarea(event);
  }

  updateActionTechnicalNotes(event: Event): void {
    this.actionTechnicalNotes.set((event.target as HTMLTextAreaElement).value);
    this.autoResizeTextarea(event);
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
    const activeFramework = this.activeFramework();
    if (activeFramework === 'transformation') {
      if (!this.sourceSubject().trim() || !this.targetSubject().trim() || this.isLoading()) {
        return;
      }
    } else if (activeFramework !== 'logo-reveal') {
       if (!this.subject().trim() || this.isLoading()) {
        return;
      }
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.generatedPrompt.set(null);
    this.coPilotOutput.set(null);
    this.outputViewMode.set('text');
    this.clearWorkspace();

    try {
      if (activeFramework === 'transformation') {
        const result = await this.geminiService.generateTransformationPrompt(this.sourceSubject(), this.targetSubject());
        this.generatedPrompt.set(result);
      } else if (activeFramework === 'cinematic' || activeFramework === 'articulated' || activeFramework === 'photoreal') {
        const format = this.promptFormat();
        if (this.aiCoPilotEnabled()) {
          const result = await this.geminiService.generateWithCoPilot(this.subject(), activeFramework as CoPilotFramework, this.cameraShots, format);
          this.coPilotOutput.set(result);
        } else {
          const outputType = this.outputType();
          const subject = this.subject();
          const cameraShots = this.showAdvanced() ? this.selectedCameraShots() : [];
          
          let styleImage: { base64: string, mimeType: string } | undefined;
          if (this.styleReferenceImage()) {
            styleImage = {
              base64: await this.fileToBase64(this.styleReferenceImage() as File),
              mimeType: (this.styleReferenceImage() as File).type
            };
          }

          let audioInputs: AudioInputs | undefined;
          if (this.showAdvanced() && (this.audioMood() || this.audioSfx() || this.audioMusic())) {
            audioInputs = {
              mood: this.audioMood(),
              sfx: this.audioSfx(),
              music: this.audioMusic()
            };
          }

          let promptGenerator: Promise<string> | undefined;

          if (activeFramework === 'cinematic') {
            promptGenerator = this.geminiService.generateCinematicPrompt(subject, outputType, cameraShots, format, styleImage, audioInputs);
          } else if (activeFramework === 'articulated') {
            promptGenerator = this.geminiService.generateArticulatedPrompt(subject, outputType, cameraShots, format, styleImage, audioInputs);
          } else if (activeFramework === 'photoreal') {
            promptGenerator = this.geminiService.generatePhotorealPrompt(subject, outputType, cameraShots, format, styleImage, audioInputs);
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

  async onRefine(): Promise<void> {
    const instruction = this.refinementInstruction().trim();
    const currentPrompt = this.generatedPrompt();
    const framework = this.activeFramework();

    if (!instruction || !currentPrompt || this.isRefining() || !(framework === 'cinematic' || framework === 'articulated' || framework === 'photoreal')) {
      return;
    }

    this.isRefining.set(true);
    this.error.set(null);

    try {
      const result = await this.geminiService.refinePrompt(
        this.subject(),
        currentPrompt,
        instruction,
        framework,
        this.promptFormat()
      );
      this.generatedPrompt.set(result);
      this.refinementInstruction.set(''); // Clear input after successful refinement
    } catch (e) {
      this.error.set('An error occurred while refining the prompt.');
      console.error(e);
    } finally {
      this.isRefining.set(false);
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
        this.styleReferenceImagePreview.set(e.target?.result as string);
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
  
  async onGenerateStoryboard(): Promise<void> {
    if (!this.storyboardScene().trim() || this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);
    this.storyboardOutput.set(null);
    try {
      const result = await this.geminiService.generateStoryboard(this.storyboardScene());
      this.storyboardOutput.set(result);
    } catch (e) {
      this.error.set('An error occurred while generating the storyboard.');
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onGenerateCharacterPacket(): Promise<void> {
    if (!this.characterDescription().trim() || this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);
    this.characterPacket.set(null);
    try {
      const result = await this.geminiService.generateCharacterPacket(this.characterDescription());
      this.characterPacket.set(result);
    } catch (e) {
      this.error.set('An error occurred while generating the character packet.');
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onGenerateMotionPrompt(): Promise<void> {
    if (!this.motionSceneDescription().trim() || !this.selectedMotionType() || this.isLoading()) {
      return;
    }
    this.isLoading.set(true);
    this.error.set(null);
    this.motionPromptOutput.set(null);

    let motionSpecific: any;
    switch(this.selectedMotionType()) {
      case 'speed_ramp': motionSpecific = this.motionSpeedRamp(); break;
      case 'bullet_time': motionSpecific = this.motionBulletTime(); break;
      case 'dolly_zoom': motionSpecific = this.motionDollyZoom(); break;
      case 'parallax_motion': motionSpecific = this.motionParallax(); break;
      case 'tilt_shift': motionSpecific = this.motionTiltShift(); break;
    }

    const params: MotionPromptParams = {
      sceneDescription: this.motionSceneDescription(),
      motionType: this.selectedMotionType(),
      duration: this.motionDuration(),
      cameraAngle: this.motionCameraAngle(),
      intensity: this.motionIntensity(),
      lighting: this.motionLighting(),
      quality: this.motionQuality(),
      frameRate: this.motionFrameRate(),
      motionSpecific,
    };

    try {
      const result = await this.geminiService.generateMotionPrompt(params);
      this.motionPromptOutput.set(result);
    } catch (e) {
      this.error.set('An error occurred while generating the motion prompt.');
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onGenerateActionPrompt(): Promise<void> {
    const mandatoryFields = [
      this.actionNarrativeCoreGoal(), this.actionNarrativeCoreStakes(), this.actionNarrativeCoreConsequence(),
      this.actionProtagonistName(), this.actionProtagonistTrait(), this.actionProtagonistFightStyle(),
      this.actionAntagonistName(), this.actionAntagonistTrait(), this.actionAntagonistFightStyle(),
      this.actionRelationship(), this.actionSetting(), this.actionAtmosphere(),
    ];
    if (this.isLoading() || mandatoryFields.some(f => !f.trim())) {
        return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.actionPromptOutput.set(null);

    try {
      const params: ActionPromptParams = {
        narrativeCore: {
          goal: this.actionNarrativeCoreGoal(),
          stakes: this.actionNarrativeCoreStakes(),
          consequence: this.actionNarrativeCoreConsequence()
        },
        characterDynamics: {
          protagonist: {
            name: this.actionProtagonistName(),
            trait: this.actionProtagonistTrait(),
            fight_style: this.actionProtagonistFightStyle()
          },
          antagonist: {
            name: this.actionAntagonistName(),
            trait: this.actionAntagonistTrait(),
            fight_style: this.actionAntagonistFightStyle()
          },
          relationship: this.actionRelationship()
        },
        environmentalContext: {
          setting: this.actionSetting(),
          atmosphere: this.actionAtmosphere(),
          keyObjects: this.actionKeyObjects().split(',').map(s => s.trim()).filter(Boolean)
        }
      };

      if (this.showActionOptional()) {
        params.visualStyle = {
          camera_angle: this.actionCameraAngle(),
          lens_choice: this.actionLensChoice(),
          lighting: this.actionLighting()
        };
        params.pacingAndRhythm = {
          opening_rhythm: this.actionOpeningRhythm(),
          climax_rhythm: this.actionClimaxRhythm(),
          transitions: this.actionTransitions().split(',').map(s => s.trim()).filter(Boolean),
          special_effects: this.actionSpecialEffects().split(',').map(s => s.trim()).filter(Boolean)
        };
        params.soundDesign = {
          ambient_sounds: this.actionAmbientSounds(),
          impact_sounds: this.actionImpactSounds(),
          sound_design: this.actionSoundDesignNotes()
        };
        params.technicalNotes = this.actionTechnicalNotes();
      }
      
      const result = await this.geminiService.generateActionPrompt(params);
      this.actionPromptOutput.set(result);
    } catch (e) {
      this.error.set('An error occurred while generating the action prompt.');
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Methods to fix template errors by handling updates in the component
  updateMotionSpeedRamp(field: 'start' | 'end' | 'point' | 'curve', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.motionSpeedRamp.update(current => ({ ...current, [field]: value }));
  }

  updateMotionBulletTime(field: 'arc' | 'duration', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.motionBulletTime.update(current => ({ ...current, [field]: value }));
  }

  updateMotionDollyZoomDirection(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'in' | 'out';
    this.motionDollyZoom.update(current => ({
        ...current,
        dolly: value,
        zoom: value === 'in' ? 'out' : 'in'
    }));
  }
  
  updateMotionDollyZoomIntensity(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'subtle' | 'moderate' | 'dramatic';
    this.motionDollyZoom.update(current => ({ ...current, intensity: value }));
  }

  updateMotionParallaxLayers(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.motionParallax.update(current => ({ ...current, layers: value }));
  }

  updateMotionParallaxSeparation(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.motionParallax.update(current => ({ ...current, separation: value }));
  }

  updateMotionTiltShift(field: 'angle' | 'blur', event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    this.motionTiltShift.update(current => ({ ...current, [field]: value }));
  }

  copyToClipboard(): void {
    let textToCopy: string | null = null;

    switch (this.activeFramework()) {
      case 'transformation':
        textToCopy = this.generatedPrompt();
        break;
      case 'logo-reveal':
        textToCopy = this.logoRevealJson();
        break;
      case 'storyboard':
        textToCopy = this.storyboardJson();
        break;
      case 'character':
        textToCopy = this.characterPacketJson();
        break;
      case 'motion':
        textToCopy = this.motionPromptOutput();
        break;
      case 'action':
        textToCopy = this.actionPromptJson();
        break;
      default:
        if (this.aiCoPilotEnabled()) {
            const parsed = this.parsedCoPilotOutput();
            if (this.concisePromptEnabled() && parsed) {
              textToCopy = parsed.outputPrompt;
            } else {
              textToCopy = this.coPilotJson() ?? this.coPilotOutput();
            }
        } else {
            if (this.promptFormat() === 'text' || this.outputViewMode() === 'text') {
                textToCopy = this.promptSections().map(s => `${s.title}:\n${s.content}`).join('\n\n');
            } else {
                textToCopy = this.jsonPrompt();
            }
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
