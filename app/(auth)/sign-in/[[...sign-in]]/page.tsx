import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal mb-2">
            Welcome Back
          </h1>
          <p className="text-charcoal-light">
            Sign in to continue to ContentPilot AI
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
