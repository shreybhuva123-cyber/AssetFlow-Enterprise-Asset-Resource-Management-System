export interface ExtractedDocument {
  vendor?: string;
  purchaseDate?: string;
  serialNumber?: string;
  warrantyExpiry?: string;
  model?: string;
  manufacturer?: string;
  rawText: string;
}

export interface OCRProvider {
  processInvoice(fileBuffer: Buffer, mimeType: string): Promise<ExtractedDocument>;
  processWarranty(fileBuffer: Buffer, mimeType: string): Promise<ExtractedDocument>;
}
