export interface GeneratedPost {
    topic: string;
    pillar: string;
    variants: {
        id: string;
        letter: 'A' | 'B' | 'C';
        text: string;
        characterCount: number;
        angle: string;
    }[];
}

export function generateMockPost(pillar: string, hasVoice: boolean): GeneratedPost {
    const topics: Record<string, string> = {
        "Founder Journey": "The brutal truth about startup burnout nobody talks about",
        "SaaS Growth": "We hit $100K MRR. Here are the 3 things that actually moved the needle",
        "AI Trends": "GPT-5 just dropped. Here's what it means for your business",
        "Remote Leadership": "Why I track output, not hours (and you should too)",
        "Product Management": "Stop building features. Start solving problems.",
        "Marketing Psychology": "The psychology behind why we buy (it's not what you think)"
    };

    // Default to Founder Journey if pillar not found or generic
    const topic = topics[pillar] || topics["Founder Journey"];

    const variants = [
        {
            id: 'var_a',
            letter: 'A' as const,
            angle: 'Data-Driven & Analytical',
            text: `Let's look at the data. 📊\n\nMost people think ${topic.toLowerCase()} is about luck. It's not.\n\nHere are the numbers:\n- 40% of success comes from consistency\n- 35% from strategy\n- 25% from execution\n\nIf you're ignoring the metrics, you're flying blind. #DataDriven #${pillar.replace(/\s/g, '')}`,
            characterCount: 245
        },
        {
            id: 'var_b',
            letter: 'B' as const,
            angle: 'Personal Story & Emotional',
            text: `I used to struggle with ${topic.toLowerCase()}. It kept me up at night.\n\nI felt overwhelmed. I felt stuck. But then I made one small change...\n\nI realized that it wasn't about doing MORE. It was about doing BETTER.\n\nHere's what I learned along the way. 👇 #${pillar.replace(/\s/g, '')} #Transparency`,
            characterCount: 260
        },
        {
            id: 'var_c',
            letter: 'C' as const,
            angle: 'Contrarian & Bold',
            text: `Unpopular opinion: Everything you've been told about ${topic.toLowerCase()} is WRONG. 🚫\n\n"Best practices" are just average practices.\n\nIf you want outlier results, you need to stop following the herd.\n\nHere is the truth nobody wants to verify. 🧵 #${pillar.replace(/\s/g, '')} #HotTake`,
            characterCount: 275
        }
    ];

    return {
        topic,
        pillar,
        variants
    };
}
