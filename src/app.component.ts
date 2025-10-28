import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { PalmReadingComponent } from './components/palm-reading/palm-reading.component';
import { KundaliComponent } from './components/kundali/kundali.component';
import { VoiceAssistantComponent } from './components/voice-assistant/voice-assistant.component';

export type Page = 'home' | 'dailyHoroscope' | 'calendar' | 'emotions' | 'more' | 'switchWords' | 'palmReading' | 'kundali';
export type HoroscopeTab = 'love' | 'career' | 'health';

export interface ZodiacSign {
  name: string;
  icon: string;
}
export interface EmotionCard {
  title: string;
  subtitle: string;
}
export interface NavItem {
  id: Exclude<Page, 'dailyHoroscope' | 'palmReading' | 'kundali'>;
  icon: string;
  label: string;
}
export interface SwitchWord {
  word: string;
  purpose: string;
}
export interface SwitchWordCategory {
  name: string;
  description: string;
  words: SwitchWord[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PalmReadingComponent, KundaliComponent, VoiceAssistantComponent],
})
export class AppComponent {
  page = signal<Page>('home');
  history = signal<Page[]>(['home']);
  horoscopeTab = signal<HoroscopeTab>('love');
  isVoiceAssistantOpen = signal(false);

  selectedSwitchWordCategory = signal<SwitchWordCategory | null>(null);

  currentDate = signal(new Date());
  calendarDays = computed(() => {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: (string|number)[] = Array.from({ length: firstDayOfMonth }, () => '');
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  });
  monthName = computed(() => this.currentDate().toLocaleString('default', { month: 'long' }));
  weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  dayOfMonthWithSuffix = computed(() => {
    const day = this.currentDate().getDate();
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
      case 1:  return `${day}st`;
      case 2:  return `${day}nd`;
      case 3:  return `${day}rd`;
      default: return `${day}th`;
    }
  });

  horoscopeDateHeader = computed(() => {
    const date = this.currentDate();
    const dayName = date.toLocaleString('default', { weekday: 'long' });
    const monthName = date.toLocaleString('default', { month: 'long' });
    return `${dayName}, ${monthName} ${this.dayOfMonthWithSuffix()}`;
  });

  horoscopeDateSubheader = computed(() => {
      const date = this.currentDate();
      const dayName = date.toLocaleString('default', { weekday: 'long' });
      const monthName = date.toLocaleString('default', { month: 'long' });
      const day = date.getDate();
      return `${dayName}, ${monthName} ${day}`;
  });

  zodiacSigns: ZodiacSign[] = [
      { name: 'Aries', icon: '♈' }, { name: 'Taurus', icon: '♉' },
      { name: 'Gemini', icon: '♊' }, { name: 'Cancer', icon: '♋' },
      { name: 'Leo', icon: '♌' }, { name: 'Virgo', icon: '♍' },
      { name: 'Libra', icon: '♎' }, { name: 'Scorpio', icon: '♏' },
      { name: 'Sagittarius', icon: '♐' }, { name: 'Capricorn', icon: '♑' },
      { name: 'Aquarius', icon: '♒' }, { name: 'Pisces', icon: '♓' }
  ];

  emotionCards: EmotionCard[] = [
    { title: 'Betrayal', subtitle: 'All reflections...' },
    { title: 'Healing', subtitle: 'Reverse from...' },
    { title: 'Dreams', subtitle: 'Do not let...' },
    { title: 'Destiny', subtitle: 'No auto...' }
  ];
  
  moreLinks = ['Mantras', 'Youtube Videos', 'Share with Friends', 'Rate App', 'Privacy Policy'];

  navItems: NavItem[] = [
    { id: 'home', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`, label: 'Home' },
    { id: 'calendar', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`, label: 'Calendar' },
    { id: 'switchWords', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m15.5 8-4 4 4 4"/><path d="m8.5 8 4 4-4 4"/></svg>`, label: 'Switch Words' },
    { id: 'emotions', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`, label: 'Emotions'},
    // FIX: Completed the icon svg and added the required 'label' property.
    { id: 'more', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`, label: 'More' }
  ];
  
  switchWordsCategories: SwitchWordCategory[] = [
    {
      name: 'Money & Abundance',
      description: 'Chant these words to attract wealth and prosperity into your life.',
      words: [
        { word: 'COUNT', purpose: 'To attract money.' },
        { word: 'FIND', purpose: 'To increase wealth.' },
        { word: 'DIVINE', purpose: 'For unexpected miracles.' },
        { word: 'GIGGLE', purpose: 'To enjoy the process.' }
      ]
    },
    {
      name: 'Health & Healing',
      description: 'Use these powerful words to promote physical and mental well-being.',
      words: [
        { word: 'BE', purpose: 'For good health.' },
        { word: 'ADJUST', purpose: 'To handle discomfort.' },
        { word: 'CHANGE', purpose: 'To relieve pain.' },
        { word: 'CLEAR', purpose: 'To reduce allergies.' }
      ]
    },
    {
      name: 'Love & Relationships',
      description: 'Attract and enhance loving connections in your life.',
      words: [
        { word: 'TOGETHER', purpose: 'To build relationships.' },
        { word: 'LOVE', purpose: 'To generate and attract love.' },
        { word: 'CONNECT', purpose: 'To strengthen bonds.' },
        { word: 'PRAISE', purpose: 'To feel beautiful.' }
      ]
    },
    {
      name: 'Success & Career',
      description: 'Chant these words to achieve your goals and advance in your career.',
      words: [
        { word: 'REACH', purpose: 'To find what you are looking for.' },
        { word: 'JUDGE', purpose: 'To get a promotion.' },
        { word: 'VICTORY', purpose: 'For success in any endeavor.' },
        { word: 'ON', purpose: 'To create new ideas.' }
      ]
    },
    {
        name: 'Peace & Protection',
        description: 'Find inner calm and shield yourself from negativity.',
        words: [
          { word: 'CANCEL', purpose: 'To eliminate negativity.' },
          { word: 'GUARD', purpose: 'For protection from harm.' },
          { word: 'CRYSTAL', purpose: 'For clarity of mind.' },
          { word: 'UP', purpose: 'To boost confidence.' }
        ]
    }
  ];

  goBack() {
    const history = this.history();
    if (history.length > 1) {
      history.pop();
      const previousPage = history[history.length - 1];
      this.history.set([...history]);
      this.page.set(previousPage);
    }
  }

  navigateTo(page: Page) {
    if (this.page() !== page) {
      const currentHistory = this.history();
      
      const pageIndex = currentHistory.indexOf(page);
      if (pageIndex !== -1) {
        // If the page is already in history, it's a "back" navigation in a way
        // We trim the history to that point
        this.history.set(currentHistory.slice(0, pageIndex + 1));
      } else {
        // Otherwise, it's a forward navigation
        this.history.set([...currentHistory, page]);
      }

      this.page.set(page);
      this.selectedSwitchWordCategory.set(null); // Reset category on page change
    }
  }

  selectHoroscopeTab(tab: HoroscopeTab) {
    this.horoscopeTab.set(tab);
  }

  selectSwitchWordCategory(category: SwitchWordCategory) {
    this.selectedSwitchWordCategory.set(category);
  }

  resetSwitchWordCategory() {
    this.selectedSwitchWordCategory.set(null);
  }

  prevMonth() {
    this.currentDate.update(date => {
      const newDate = new Date(date);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  }

  nextMonth() {
    this.currentDate.update(date => {
      const newDate = new Date(date);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  }
}
