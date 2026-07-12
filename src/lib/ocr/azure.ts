import type { OCRProvider, ExtractedDocument } from './provider';

// This is a placeholder for Azure Form Recognizer or AWS Textract
export class AzureOCRProvider implements OCRProvider {
  async processInvoice(_fileBuffer: Buffer, _mimeType: string): Promise<ExtractedDocument> {
    // In a real implementation, we would send this to Azure Form Recognizer API
    // using @azure/ai-form-recognizer
    
    // Simulating delay
    await new Promise(res => setTimeout(res, 1500));

    return {
      vendor: 'Dell Technologies',
      purchaseDate: '2023-11-15',
      model: 'XPS 15 9530',
      manufacturer: 'Dell',
      serialNumber: 'DL-XPS-9530-001',
      rawText: 'DELL TECHNOLOGIES INVOICE #10293...',
    };
  }

  async processWarranty(_fileBuffer: Buffer, _mimeType: string): Promise<ExtractedDocument> {
    await new Promise(res => setTimeout(res, 1000));
    return {
      warrantyExpiry: '2026-11-15',
      rawText: 'WARRANTY REGISTRATION...',
    };
  }
}

export const ocrProvider: OCRProvider = new AzureOCRProvider();
