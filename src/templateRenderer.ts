import { readFileSync } from 'fs';
import { join } from 'path';

export class TemplateRenderer {
  private static cache: Map<string, string> = new Map();
  
  static render(templateName: string, data: Record<string, any> = {}): string {
    const templatePath = join(__dirname, 'templates', `${templateName}.html`);
    

    if (!this.cache.has(templateName)) {
      try {
        const content = readFileSync(templatePath, 'utf-8');
        this.cache.set(templateName, content);
      } catch (error) {
        throw new Error(`Template '${templateName}' not found at ${templatePath}`);
      }
    }
    
    let html = this.cache.get(templateName)!;

    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      html = html.replace(new RegExp(placeholder, 'g'), String(value));
    });
    
    return html;
  }

  static clearCache(): void {
    this.cache.clear();
  }
}
