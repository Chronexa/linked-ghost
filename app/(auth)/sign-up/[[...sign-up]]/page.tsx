import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal mb-2">
            Get Started Free
          </h1>
          <p className="text-charcoal-light">
            Create your ContentPilot AI account
          </p>
        </div>
        <SignUp 
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
