/**
 * Fullscreen Layout — No sidebar, no AppShell.
 * Used for /trial/start and /onboarding which need full-screen canvas.
 * Auth is still enforced by Clerk middleware.
 */
export default function FullscreenLayout({ children }: { children: React.ReactNode }) {
    return (
        <>{children}</>
    );
}
