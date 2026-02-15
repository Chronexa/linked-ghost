/**
 * Shared Validation Constants
 * Single source of truth for all validation rules across frontend and backend
 */

export const VALIDATION = {
    // Topic content
    TOPIC_CONTENT_MIN: 50,
    TOPIC_CONTENT_MAX: 500,

    // User perspective
    PERSPECTIVE_MIN: 50,
    PERSPECTIVE_MAX: 500,

    // URLs
    URL_MAX_LENGTH: 2048,
    ALLOWED_PROTOCOLS: ['http:', 'https:'] as const,
} as const;

/**
 * Error messages for validation failures
 */
export const VALIDATION_ERRORS = {
    TOPIC_TOO_SHORT: `Topic must be at least ${VALIDATION.TOPIC_CONTENT_MIN} characters`,
    TOPIC_TOO_LONG: `Topic must be less than ${VALIDATION.TOPIC_CONTENT_MAX} characters`,
    PERSPECTIVE_TOO_SHORT: `Perspective must be at least ${VALIDATION.PERSPECTIVE_MIN} characters`,
    PERSPECTIVE_TOO_LONG: `Perspective must be less than ${VALIDATION.PERSPECTIVE_MAX} characters`,
    INVALID_URL: 'Please enter a valid HTTP or HTTPS URL',
} as const;
