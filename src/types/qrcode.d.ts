// Type declarations for packages that don't ship their own types
// These allow the project to build cleanly without ts errors

declare module 'qrcode' {
  export function toDataURL(
    data: string,
    options?: {
      errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
      width?: number;
      margin?: number;
      color?: { dark?: string; light?: string };
    },
  ): Promise<string>;

  export function toString(
    data: string,
    options?: Record<string, unknown>,
  ): Promise<string>;
}
