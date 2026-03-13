declare module 'pan-aadhaar-ocr' {
  export function extractCardDetails(filePath: string, cardType: 'AADHAAR'): Promise<{
    Number?: string;
    name?: string;
    aadhaarNumber?: string;
    dob?: string;
    gender?: string;
    address?: string;
  }>;
}