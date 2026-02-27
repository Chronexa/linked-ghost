import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

export const metadata = {
    title: 'Privacy Policy | ContentPilot AI',
    description: 'ContentPilot AI Privacy Policy. Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar />
            <main className="container mx-auto px-6 pt-32 pb-24 max-w-3xl">
                <h1 className="font-display text-4xl font-bold mb-4 tracking-tight text-gray-900">Privacy Policy</h1>
                <p className="text-sm text-gray-400 mb-12">Last updated: February 24, 2026</p>

                <div className="prose prose-gray max-w-none space-y-8 text-gray-600 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us, including your name, email address, LinkedIn post examples for voice training, and payment information. We also collect usage data about how you interact with our service.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
                        <p>We use your information to operate and improve ContentPilot AI, train your personal voice profile, process payments, and communicate with you about the service. We do not sell your data to third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">3. Your Data & AI Training</h2>
                        <p>Your LinkedIn posts and content provided for voice training are used exclusively to personalize your ContentPilot experience. We do not use your private content to train general AI models shared with other users.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Retention</h2>
                        <p>We retain your data for as long as your account is active. You may request deletion of your account and all associated data at any time by contacting support.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">5. Contact</h2>
                        <p>For any privacy-related questions, please contact us at privacy@contentpilot.ai</p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
