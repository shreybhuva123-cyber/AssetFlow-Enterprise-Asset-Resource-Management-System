export interface AIProvider {
  generateResponse(prompt: string, context: any): Promise<string>;
  extractEntities(text: string): Promise<Record<string, any>>;
}
