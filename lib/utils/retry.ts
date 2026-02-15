/**
 * Retry Utility with Exponential Backoff
 * For handling transient failures in external API calls
 */

interface RetryOptions {
    maxAttempts?: number;
    delayMs?: number;
    exponentialBackoff?: boolean;
    retryOn?: (error: Error) => boolean;
}

/**
 * Retry a function with exponential backoff
 * @param fn Function to retry
 * @param options Retry configuration
 */
export async function retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        maxAttempts = 3,
        delayMs = 1000,
        exponentialBackoff = true,
        retryOn = () => true,
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // Check if we should retry this error
            if (!retryOn(lastError)) {
                throw lastError;
            }

            // If this was the last attempt, throw
            if (attempt === maxAttempts) {
                throw lastError;
            }

            // Calculate delay with exponential backoff
            const delay = exponentialBackoff
                ? delayMs * Math.pow(2, attempt - 1)
                : delayMs;

            console.warn(
                `Retry attempt ${attempt}/${maxAttempts} failed: ${lastError.message}. ` +
                `Retrying in ${delay}ms...`
            );

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    // TypeScript doesn't know we always throw above if we get here
    throw lastError!;
}

/**
 * Check if an error is retryable (rate limits, timeouts, server errors)
 */
export function isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase();

    return (
        message.includes('rate limit') ||
        message.includes('timeout') ||
        message.includes('503') ||
        message.includes('502') ||
        message.includes('504') ||
        message.includes('econnreset') ||
        message.includes('econnrefused')
    );
}
