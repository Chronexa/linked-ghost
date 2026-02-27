import { Check, Minus, X } from 'lucide-react';

export function ComparisonSection() {
    const comparisonData = [
        { feature: "Sounds like you (not AI)", cp: 2, tl: 1, mg: 1 },
        { feature: "Daily topic discovery", cp: 2, tl: 0, mg: 0 },
        { feature: "Voice match score", cp: 2, tl: 0, mg: 0 },
        { feature: "Starting price", cp: "$19/mo", tl: "$59/mo", mg: "$49/mo" },
        { feature: "Post variants per topic", cp: "3 variants", tl: "1 draft", mg: "1 draft" },
        { feature: "LinkedIn-native focus", cp: 2, tl: 2, mg: 0 },
    ];

    const renderIcon = (value: string | number, isCp: boolean) => {
        if (typeof value === 'string') {
            return <span className={isCp ? "font-semibold text-gray-900" : "font-medium text-gray-500"}>{value}</span>;
        }
        if (value === 2) return <Check className={isCp ? "text-brand w-5 h-5" : "text-green-500 w-5 h-5"} aria-label="Yes" />;
        if (value === 1) return <Minus className={isCp ? "text-gray-400 w-5 h-5" : "text-amber-500 w-5 h-5"} aria-label="Partial" />;
        return <X className="text-gray-300 w-5 h-5" aria-label="No" />;
    };

    return (
        <section className="w-full bg-white py-24 border-t border-gray-100" aria-label="Comparison Table">
            <div className="container mx-auto px-6 max-w-[900px]">
                <div className="text-center mb-16">
                    <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-4">
                        How we compare.
                    </h2>
                    <p className="text-lg text-gray-500">vs. the other LinkedIn AI tools you've probably seen</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                    {/* Header row */}
                    <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200">
                        <div className="p-5 col-span-1"></div>
                        <div className="p-5 text-center">
                            <div className="font-bold text-brand text-sm">ContentPilot</div>
                            <div className="text-xs text-gray-400 mt-0.5">You are here</div>
                        </div>
                        <div className="p-5 text-center">
                            <div className="font-semibold text-gray-700 text-sm">Taplio</div>
                            <div className="text-xs text-gray-400 mt-0.5">LinkedIn growth</div>
                        </div>
                        <div className="p-5 text-center">
                            <div className="font-semibold text-gray-700 text-sm">MagicPost</div>
                            <div className="text-xs text-gray-400 mt-0.5">AI writing</div>
                        </div>
                    </div>

                    {/* Data rows */}
                    {comparisonData.map((row, i) => (
                        <div key={i} className={`grid grid-cols-4 border-b border-gray-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                            <div className="p-5 text-sm text-gray-600 font-medium flex items-center">{row.feature}</div>
                            <div className="p-5 flex items-center justify-center bg-blue-50/30">
                                {renderIcon(row.cp, true)}
                            </div>
                            <div className="p-5 flex items-center justify-center">
                                {renderIcon(row.tl, false)}
                            </div>
                            <div className="p-5 flex items-center justify-center">
                                {renderIcon(row.mg, false)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
