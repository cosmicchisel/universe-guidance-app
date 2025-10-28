import { ChangeDetectionStrategy, Component, OnDestroy, signal, inject, input } from '@angular/core';
import { GeminiService, PalmReading } from '../../services/gemini.service';

@Component({
  selector: 'app-palm-reading',
  templateUrl: './palm-reading.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PalmReadingComponent implements OnDestroy {
  goBack = input.required<() => void>();
  
  private geminiService = inject(GeminiService);

  // Palm Reading State
  palmReadingState = signal<'idle' | 'analyzing' | 'result'>('idle');
  uploadedPalmImage = signal<string | null>(null);
  palmReadingResult = signal<PalmReading | null>(null);
  palmReadingError = signal<string | null>(null);
  userQuestion = signal('');
  
  analysisMessages = ['Analyzing your life line...', 'Reading your heart line...', 'Decoding your head line...', 'Tracing your fate line...', 'Consulting the cosmos...'];
  currentAnalysisMessage = signal(this.analysisMessages[0]);
  private analysisInterval: ReturnType<typeof setInterval> | undefined;

  ngOnDestroy(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedPalmImage.set(e.target?.result as string);
        input.value = ''; // Reset file input
      };
      reader.readAsDataURL(file);
    }
  }

  async analyzePalm() {
    const image = this.uploadedPalmImage();
    if (!image) return;
    
    this.palmReadingState.set('analyzing');
    this.palmReadingError.set(null);
    this.palmReadingResult.set(null);
    this.startAnalysisAnimation();

    try {
      const result = await this.geminiService.analyzePalm(image, this.userQuestion());
      this.palmReadingResult.set(result);
      this.palmReadingState.set('result');
    } catch (e) {
      console.error(e);
      this.palmReadingError.set('Sorry, the cosmos seems to be hiding its secrets. We couldn\'t analyze your palm right now. Please try again with a clearer picture.');
      this.palmReadingResult.set(null);
      this.palmReadingState.set('result');
    } finally {
      if (this.analysisInterval) {
        clearInterval(this.analysisInterval);
      }
    }
  }

  startAnalysisAnimation() {
    if (this.analysisInterval) clearInterval(this.analysisInterval);
    let index = 0;
    this.currentAnalysisMessage.set(this.analysisMessages[index]);
    this.analysisInterval = setInterval(() => {
      index = (index + 1) % this.analysisMessages.length;
      this.currentAnalysisMessage.set(this.analysisMessages[index]);
    }, 2500);
  }

  handleGoBack() {
    // If we are in a result or analyzing state, the first "back" action
    // should return to the idle (upload) state of this component.
    if (this.palmReadingState() !== 'idle') {
      this.palmReadingState.set('idle');
      this.uploadedPalmImage.set(null);
      this.palmReadingResult.set(null);
      this.palmReadingError.set(null);
      this.userQuestion.set('');
      if (this.analysisInterval) {
        clearInterval(this.analysisInterval);
      }
    } else {
      // If already in the idle state, then navigate away from the palm reading page.
      this.goBack();
    }
  }

  updateUserQuestion(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.userQuestion.set(target.value);
  }
}
