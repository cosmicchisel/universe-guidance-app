import { ChangeDetectionStrategy, Component, OnDestroy, signal, inject, input, computed } from '@angular/core';
import { GeminiService, KundaliReading } from '../../services/gemini.service';

declare var jsPDF: any;

@Component({
  selector: 'app-kundali',
  templateUrl: './kundali.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KundaliComponent implements OnDestroy {
  goBack = input.required<() => void>();
  
  private geminiService = inject(GeminiService);

  // Component State
  state = signal<'idle' | 'analyzing' | 'result'>('idle');
  result = signal<KundaliReading | null>(null);
  error = signal<string | null>(null);
  
  // Form State
  name = signal('');
  dob = signal('');
  tob = signal('');
  pob = signal('');

  isFormValid = computed(() => {
    return this.name().trim() !== '' && this.dob().trim() !== '' && this.tob().trim() !== '' && this.pob().trim() !== '';
  });

  // Analysis Animation State
  analysisMessages = ['Casting your cosmic blueprint...', 'Aligning the planets...', 'Consulting ancient scriptures...', 'Interpreting planetary positions...'];
  currentAnalysisMessage = signal(this.analysisMessages[0]);
  private analysisInterval: ReturnType<typeof setInterval> | undefined;

  ngOnDestroy(): void {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }
  }

  async generateKundali() {
    if (!this.isFormValid()) return;
    
    this.state.set('analyzing');
    this.error.set(null);
    this.result.set(null);
    this.startAnalysisAnimation();

    try {
      const reading = await this.geminiService.generateKundali(this.name(), this.dob(), this.tob(), this.pob());
      this.result.set(reading);
      this.state.set('result');
    } catch (e) {
      console.error(e);
      this.error.set('The celestial energies are currently clouded. We couldn\'t generate your chart at this moment. Please try again later.');
      this.result.set(null);
      this.state.set('result');
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
    if (this.state() !== 'idle') {
      this.state.set('idle');
      this.result.set(null);
      this.error.set(null);
      if (this.analysisInterval) {
        clearInterval(this.analysisInterval);
      }
    } else {
      this.goBack();
    }
  }
  
  updateField(field: 'name' | 'dob' | 'tob' | 'pob', event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this[field].set(value);
  }

  downloadAsPdf() {
    const reading = this.result();
    const name = this.name();
    if (!reading || !name) return;

    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = pageWidth - margin * 2;
    let y = 20;

    doc.setFontSize(22);
    doc.setFont('times', 'bold');
    doc.text('Your Vedic Birth Chart', pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(16);
    doc.setFont('times', 'normal');
    doc.text(`For: ${name}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    const addSection = (title: string, content: string) => {
      if (y > 260) { // Add new page if content is near the bottom
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(14);
      doc.setFont('times', 'bold');
      doc.text(title, margin, y);
      y += 8;
      doc.setFontSize(11);
      doc.setFont('times', 'normal');
      const textLines = doc.splitTextToSize(content, textWidth);
      doc.text(textLines, margin, y);
      y += (textLines.length * 5) + 10;
    };

    addSection('Lagna Chart Analysis', reading.lagnaChart);
    addSection('Detailed Kundali Analysis', reading.kundaliAnalysis);
    addSection('Vaideeswaran Koil Palm Leaf Insights', reading.palmLeafInsights);
    addSection('Astrological Remedies', reading.remedies);

    doc.save(`kundali-chart-${name.toLowerCase().replace(/\s/g, '-')}.pdf`);
  }
}
