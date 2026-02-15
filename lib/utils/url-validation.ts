/**
 * URL Validation and Sanitization Utilities
 * Prevents XSS attacks via javascript: and data: protocols
 */

import { VALIDATION } from '../constants/validation';

/**
 * Check if a URL uses a safe protocol (HTTP/HTTPS only)
 * Prevents javascript:, data:, file:, and other dangerous protocols
 */
export function isSafeUrl(url: string | null | undefined): boolean {
    if (!url) return false;

    try {
        const parsed = new URL(url);
        return VALIDATION.ALLOWED_PROTOCOLS.includes(parsed.protocol as any);
    } catch {
        // Invalid URL format
        return false;
    }
}

/**
 * Sanitize a URL for display
 * Returns null if unsafe, otherwise returns the URL
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    const trimmed = url.trim();
    if (!isSafeUrl(trimmed)) {
        console.warn(`Unsafe URL blocked: ${trimmed.substring(0, 50)}...`);
        return null;
    }

    return trimmed;
}

/**
 * Validate URL format and protocol
 * Returns error message if invalid, null if valid
 */
export function validateUrl(url: string): string | null {
    if (!url) return null; // Optional URL

    if (url.length > VALIDATION.URL_MAX_LENGTH) {
        return `URL too long (max ${VALIDATION.URL_MAX_LENGTH} characters)`;
    }

    try {
        const parsed = new URL(url);

        if (!VALIDATION.ALLOWED_PROTOCOLS.includes(parsed.protocol as any)) {
            return 'Only HTTP and HTTPS URLs are allowed';
        }

        return null; // Valid
    } catch {
        return 'Please enter a valid URL';
    }
}
