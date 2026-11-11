/**
 * Erori pe câmp: cheia = numele câmpului, valoarea = lista de mesaje.
 * @example { price: ['price must be a positive number'] }
 */
export type ErrorDetails = Record<string, string[]>;

/** Envelope uniform pentru orice eroare a API-ului. */
export type ErrorResponse = {
  statusCode: number;
  code: string;
  message: string;
  details: ErrorDetails | null;
  meta: {
    path: string;
    timestamp: string;
  };
};
