import { Injectable, signal, inject } from '@angular/core';
import { GeminiService } from './gemini.service';

// Polyfill for SpeechRecognition
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export type VoiceLanguage = 'ta-IN' | 'kn-IN' | 'tcy-IN';
export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

@Injectable({
  providedIn: 'root'
})
export class VoiceAssistantService {
  private geminiService = inject(GeminiService);
  private recognition: any | null = null;

  status = signal<VoiceStatus>('idle');
  transcript = signal('');
  aiResponse = signal('');
  error = signal('');
  
  isSupported = signal(!!SpeechRecognition && !!window.speechSynthesis);

  constructor() {
    if (!this.isSupported()) {
      this.error.set('Voice recognition or synthesis is not supported in your browser.');
      this.status.set('error');
    }
  }

  startListening(language: VoiceLanguage): void {
    if (!this.isSupported() || this.status() === 'listening') {
      return;
    }

    this.resetState();
    this.status.set('listening');

    this.recognition = new SpeechRecognition();
    this.recognition.lang = language;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event: any) => {
      const interimTranscript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      this.transcript.set(interimTranscript);

      if (event.results[0].isFinal) {
        this.stopListening();
      }
    };

    this.recognition.onerror = (event: any) => {
      this.error.set(`Speech recognition error: ${event.error}`);
      this.status.set('error');
    };
    
    this.recognition.start();
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
    
    if (this.transcript().trim().length > 0) {
      this.status.set('processing');
      this.getGuidance();
    } else {
      this.status.set('idle');
    }
  }

  private async getGuidance(): Promise<void> {
    try {
      const langMap: Record<VoiceLanguage, string> = {
        'ta-IN': 'Tamil',
        'kn-IN': 'Kannada',
        'tcy-IN': 'Tulu'
      };
      const currentLang = this.recognition?.lang || 'ta-IN';
      const languageName = langMap[currentLang as VoiceLanguage];

      const response = await this.geminiService.getSpiritualGuidance(this.transcript(), languageName);
      this.aiResponse.set(response);
      this.speak(response, currentLang);
    } catch (e) {
      console.error(e);
      this.error.set('Could not get guidance from the cosmos. Please try again.');
      this.status.set('error');
    }
  }

  speak(text: string, lang: string): void {
    if (!window.speechSynthesis) {
        this.status.set('idle');
        return;
    }
    
    this.status.set('speaking');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    // Tulu might not have a voice, so this is a fallback.
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang === lang);
    if (voice) {
        utterance.voice = voice;
    }

    utterance.onend = () => {
      this.status.set('idle');
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.error.set('Sorry, I am unable to speak at this moment.');
      this.status.set('error');
    };
    
    window.speechSynthesis.speak(utterance);
  }

  cancel(): void {
    if (this.recognition) {
        this.recognition.abort();
        this.recognition = null;
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    this.resetState();
  }

  private resetState(): void {
    this.status.set('idle');
    this.transcript.set('');
    this.aiResponse.set('');
    this.error.set('');
  }
}
