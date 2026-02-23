import Link from 'next/link';
import { Button } from '@/components/ui';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#FFFCF2] flex flex-col">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-[#FFFCF2] border-b border-[#E8E2D8] backdrop-blur-sm bg-opacity-95">
                <div className="container mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="w-10 h-10 bg-[#C1502E] rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                                <span className="text-white font-display font-bold text-xl">CP</span>
                            </div>
                            <span className="text-xl font-display font-semibold text-[#1A1A1D]">
                                ContentPilot AI
                            </span>
                        </Link>
                        <div className="hidden md:flex items-center space-x-8">
                            <Link href="/#features" className="text-[#52525B] hover:text-[#1A1A1D] transition font-medium">
                                Features
                            </Link>
                            <Link href="/pricing" className="text-[#52525B] hover:text-[#1A1A1D] transition font-medium">
                                Pricing
                            </Link>
                            <Link href="/dashboard">
                                <Button variant="secondary" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-[#E8E2D8] bg-white">
                <div className="container mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-between">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <div className="w-8 h-8 bg-[#C1502E] rounded-lg flex items-center justify-center">
                                <span className="text-white font-display font-bold text-lg">CP</span>
                            </div>
                            <span className="font-display font-semibold text-[#1A1A1D]">ContentPilot AI</span>
                        </div>

                        <div className="flex items-center space-x-6">
                            <a
                                href="https://www.producthunt.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#52525B] hover:text-[#C1502E] transition"
                            >
                                Product Hunt
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#52525B] hover:text-[#C1502E] transition"
                            >
                                Twitter
                            </a>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-[#E8E2D8] text-center text-sm text-[#52525B]">
                        © {new Date().getFullYear()} ContentPilot AI. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
