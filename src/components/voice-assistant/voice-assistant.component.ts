import { ChangeDetectionStrategy, Component, input, output, inject, signal } from '@angular/core';
import { VoiceAssistantService, VoiceLanguage, VoiceStatus } from '../../services/voice-assistant.service';

interface Language {
  code: VoiceLanguage;
  name: string;
  native: string;
}

@Component({
  selector: 'app-voice-assistant',
  templateUrl: './voice-assistant.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoiceAssistantComponent {
  isOpen = input.required<boolean>();
  close = output<void>();

  voiceService = inject(VoiceAssistantService);

  selectedLanguage = signal<VoiceLanguage>('ta-IN');

  languages: Language[] = [
    { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்' },
    { code: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'tcy-IN', name: 'Tulu', native: 'ತುಳು' },
  ];
  
  statusMessages: Record<VoiceStatus, string> = {
    idle: 'Tap the orb to ask a question',
    listening: 'Listening...',
    processing: 'Consulting the cosmos...',
    speaking: 'Speaking...',
    error: 'Something went wrong',
  };

  handleOrbClick(): void {
    if (this.voiceService.status() === 'listening') {
      this.voiceService.stopListening();
    } else {
      this.voiceService.startListening(this.selectedLanguage());
    }
  }

  handleClose(): void {
    this.voiceService.cancel();
    this.close.emit();
  }
  
  selectLanguage(langCode: VoiceLanguage): void {
    this.selectedLanguage.set(langCode);
    if (this.voiceService.status() === 'listening') {
        this.voiceService.stopListening();
        this.voiceService.startListening(langCode);
    }
  }
}
