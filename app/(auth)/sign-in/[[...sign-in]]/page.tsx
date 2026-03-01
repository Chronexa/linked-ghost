import { SignIn } from '@clerk/nextjs';
import { GhostLogo } from '@/components/brand/ghost-logo';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FEF3EF] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GhostLogo size={40} />
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal mb-2">
            Welcome Back
          </h1>
          <p className="text-charcoal-light">
            Sign in to continue to LinkedIn Ghostwriter AI
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-card-hover bg-surface border border-border rounded-lg',
              headerTitle: 'font-display text-charcoal',
              headerSubtitle: 'text-charcoal-light',
              socialButtonsBlockButton: 'border-border hover:bg-background transition',
              formButtonPrimary: 'bg-brand hover:bg-brand-dark text-white',
              formFieldInput: 'border-border focus:border-brand focus:ring-brand',
              footerActionLink: 'text-brand-text hover:text-brand',
            },
          }}
        />
      </div>
    </div>
  );
}
