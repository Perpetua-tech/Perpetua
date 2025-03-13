/**
 * Utility functions collection
 */

/**
 * Generate a random string with specified length
 * Contains letters and numbers
 * @param length String length
 * @returns Random string
 */
export function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

/**
 * Format currency amount
 * @param amount Amount
 * @param decimals Decimal places
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return amount.toFixed(decimals);
}

/**
 * Truncate string length, representing excess with ellipsis
 * @param str Original string
 * @param maxLength Maximum length
 * @returns Processed string
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

/**
 * Generate UUID
 * @returns UUID string
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, 
          v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Extract abbreviated form from address
 * Example: 0x1234...abcd
 * @param address Wallet address
 * @param startChars Number of characters to keep at start
 * @param endChars Number of characters to keep at end
 * @returns Abbreviated address
 */
export function shortenAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address) return '';
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
}

/**
 * Delay function
 * @param ms Milliseconds
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safe JSON parsing
 * @param str JSON string to parse
 * @param fallback Return value if parsing fails
 * @returns Parsing result
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch (error) {
    return fallback;
  }
}

/**
 * Get current ISO format date string
 * @returns ISO date string
 */
export function getCurrentISODate(): string {
  return new Date().toISOString();
}

/**
 * Check if string is a valid Ethereum address
 * @param address Address to check
 * @returns Whether valid
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
} 