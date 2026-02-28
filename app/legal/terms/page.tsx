import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export const metadata = {
    title: 'Terms of Service | LinkedIn Ghostwriter AI',
    description: 'Terms of Service for LinkedIn Ghostwriter AI. Please read these terms carefully before using our service.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Navbar />
            <main className="container mx-auto px-6 pt-32 pb-24 max-w-4xl">
                <div className="mb-12 border-b border-gray-100 pb-8">
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Terms of Service</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">Last updated: February 28, 2026</p>
                </div>

                <div className="prose prose-gray max-w-none space-y-12">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                        <p className="leading-relaxed text-gray-600">
                            By accessing or using <strong>LinkedIn Ghostwriter AI</strong> ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                        <p className="leading-relaxed text-gray-600">
                            LinkedIn Ghostwriter AI provides AI-powered content generation tools designed to assist users in creating content for LinkedIn. The Service includes features like voice cloning, topic discovery, and AI-assisted drafting.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. Eligibility</h2>
                        <p className="leading-relaxed text-gray-600">
                            You must be at least 18 years of age or the legal age of majority in your jurisdiction to use this Service. By using the Service, you represent and warrant that you meet these eligibility requirements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. User Content & License</h2>
                        <div className="space-y-4">
                            <p className="leading-relaxed text-gray-600">
                                You retain all ownership rights to the content you provide to the Service (e.g., your past LinkedIn posts). However, by providing content, you grant us a worldwide, non-exclusive, royalty-free license to use, store, and process that content solely for the purpose of providing the Service to you (such as training your personal voice model).
                            </p>
                            <p className="leading-relaxed text-gray-600 font-medium">
                                You are solely responsible for the accuracy and legality of the content you generate and post to LinkedIn.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Prohibited Conduct</h2>
                        <p className="leading-relaxed text-gray-600 mb-4">You agree not to:</p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li>Use the Service for any illegal purpose or to generate harmful, deceptive, or offensive content.</li>
                            <li>Attempt to reverse engineer, scrape, or interfere with the proper working of the Service.</li>
                            <li>Use the Service to impersonate others without authorization.</li>
                            <li>Violate LinkedIn's own terms of service while using our generated content.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Subscriptions & Payments</h2>
                        <div className="space-y-4">
                            <p className="leading-relaxed text-gray-600">
                                Certain features of the Service require a paid subscription. All payments are processed via <strong>Razorpay</strong>.
                            </p>
                            <p className="leading-relaxed text-gray-600">
                                <strong>Refund Policy:</strong> Due to the nature of AI generation costs, fees are generally non-refundable once content generation has been successfully performed. Please review our pricing carefully before subscribing.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
                        <p className="leading-relaxed text-gray-600 italic border-l-4 border-gray-200 pl-4">
                            The Service is provided "as is" and "as available". To the maximum extent permitted by law, LinkedIn Ghostwriter AI shall not be liable for any indirect, incidental, or consequential damages resulting from your use of the Service, including any impact on your LinkedIn account status or professional reputation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
                        <p className="leading-relaxed text-gray-600">
                            We reserve the right to suspend or terminate your access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or our business interests.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
                        <p className="leading-relaxed text-gray-600">
                            If you have any questions about these Terms, please contact us at <strong>support@linkedinghostwriter-ai.com</strong>.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
