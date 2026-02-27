export function SocialProofSection() {
    return (
        <section className="w-full bg-white py-16 border-y border-gray-100" aria-label="Social Proof metrics">
            <div className="container mx-auto px-6 max-w-[1100px]">
                <h3 className="text-center text-xs font-semibold tracking-widest text-gray-400 uppercase mb-10">
                    BUILT FOR FOUNDERS, CONSULTANTS, AND THOUGHT LEADERS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
                        <div className="text-3xl font-display font-bold text-gray-900 mb-2">94%</div>
                        <div className="text-sm font-medium text-gray-500">Average voice match score</div>
                        <div className="text-xs text-gray-400 mt-1">Across all generated posts</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
                        <div className="text-3xl font-display font-bold text-gray-900 mb-2">&lt; 3 min</div>
                        <div className="text-sm font-medium text-gray-500">Average time per post</div>
                        <div className="text-xs text-gray-400 mt-1">From topic to publish-ready draft</div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
                        <div className="text-3xl font-display font-bold text-gray-900 mb-2">3</div>
                        <div className="text-sm font-medium text-gray-500">Post variants per topic</div>
                        <div className="text-xs text-gray-400 mt-1">Story, insight, and list formats</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
