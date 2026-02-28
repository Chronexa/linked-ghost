import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export const metadata = {
    title: 'Privacy Policy | LinkedIn Ghostwriter AI',
    description: 'Privacy Policy for LinkedIn Ghostwriter AI. Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            <Navbar />
            <main className="container mx-auto px-6 pt-32 pb-24 max-w-4xl">
                <div className="mb-12 border-b border-gray-100 pb-8">
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Privacy Policy</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">Last updated: February 28, 2026</p>
                </div>

                <div className="prose prose-gray max-w-none space-y-12">
                    <section>
                        <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                        <p className="leading-relaxed text-gray-600">
                            Welcome to <strong>LinkedIn Ghostwriter AI</strong>. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
                        <div className="space-y-4">
                            <p className="leading-relaxed text-gray-600">We collect information that you provide directly to us:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600">
                                <li><strong>Account Data:</strong> Name, email address, and profile picture (via Clerk/Google/LinkedIn authentication).</li>
                                <li><strong>LinkedIn Content:</strong> Examples of your past LinkedIn posts and profile details, which you provide for the purpose of "Voice Cloning" and stylistic training.</li>
                                <li><strong>Payment Information:</strong> Processed securely through <strong>Razorpay</strong>. We do not store your full credit card details on our servers.</li>
                                <li><strong>Usage Data:</strong> Information on how you interact with our tools, including prompts and generated content.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                        <p className="leading-relaxed text-gray-600">
                            Your data is used solely to provide and improve our services, specifically:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600 mt-4">
                            <li>To create your personalized "Voice Profile" so your AI-generated posts sound authentic to you.</li>
                            <li>To generate LinkedIn content based on your topics and research.</li>
                            <li>To manage your subscription and process payments.</li>
                            <li>To provide customer support and send service-related notifications.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">4. Data Privacy & AI Training</h2>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 my-6">
                            <p className="text-blue-900 font-medium leading-relaxed">
                                <strong>Your privacy is our priority.</strong> We do not use your private content or personal LinkedIn posts to train general AI models shared with other users. Your training data is isolated to your specific account environment.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">5. Third-Party Service Providers</h2>
                        <p className="leading-relaxed text-gray-600 mb-4">
                            We utilize industry-leading partners to help provide our service:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li><strong>OpenAI:</strong> For natural language generation.</li>
                            <li><strong>Perplexity:</strong> For web research and topic discovery.</li>
                            <li><strong>Clerk:</strong> For secure authentication and user management.</li>
                            <li><strong>Razorpay:</strong> For secure payment processing.</li>
                            <li><strong>Upstash/Supabase:</strong> For secure data storage and queuing.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">6. Data Retention & Deletion</h2>
                        <p className="leading-relaxed text-gray-600">
                            We retain your data as long as your account is active. You have the right to request the deletion of your account and all associated data at any time. Simply contact us at <strong>support@linkedinghostwriter-ai.com</strong>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mb-4">7. Security</h2>
                        <p className="leading-relaxed text-gray-600">
                            We implement standard security measures to protect your information, including encryption of data in transit (SSL) and at rest.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
