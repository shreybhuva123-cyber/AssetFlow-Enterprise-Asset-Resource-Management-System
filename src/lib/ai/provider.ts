export interface AIProvider {
  generateResponse(prompt: string, context: Record<string, unknown>): Promise<string>;
  extractEntities(text: string): Promise<Record<string, unknown>>;
}
