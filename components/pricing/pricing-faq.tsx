import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
    {
        question: 'Is there really no credit card required for the trial?',
        answer: "Correct. You get full access to your chosen plan for 7 days, completely free. We'll only ask for payment details when your trial ends and you decide to continue."
    },
    {
        question: 'What counts as a "post"?',
        answer: "A post is counted when you approve a draft. You can generate unlimited drafts and only commit when you're happy with one."
    },
    {
        question: 'Can I switch plans?',
        answer: "Yes. You can upgrade or downgrade at any time from your Settings → Billing page. Changes take effect immediately."
    },
    {
        question: 'What happens if I hit my post limit?',
        answer: "You'll see a friendly prompt to upgrade. We never cut off access mid-month — you can still view and edit existing drafts."
    },
    {
        question: 'Do you offer refunds?',
        answer: "If you're not satisfied within the first 14 days of a paid subscription, we'll refund you. No questions asked."
    },
    {
        question: 'Can I use this for multiple LinkedIn accounts?',
        answer: "Currently, each subscription supports one LinkedIn profile. Agency multi-account support is on our roadmap."
    },
    {
        question: 'How does ContentPilot learn my voice?',
        answer: "You paste 2-3 of your past LinkedIn posts during setup. Our AI analyzes your tone, structure, vocabulary, and style — and uses that as a template for every post it generates."
    },
    {
        question: 'What topics will it write about?',
        answer: "ContentPilot pulls from news, Reddit, industry publications, and trending conversations in your niche. You define your content pillars (e.g. 'AI trends', 'Founder lessons'), and it stays within those lanes."
    },
    {
        question: 'Will the posts sound AI-generated?',
        answer: "Not if your voice training is good. ContentPilot matches your vocabulary and writing patterns, not generic AI templates. The more examples you give it, the better it gets."
    },
    {
        question: 'Can I edit the posts before publishing?',
        answer: "Absolutely. ContentPilot generates drafts — you always review, edit, and decide what goes live. Think of it as a first draft, not an auto-poster."
    }
];

export function PricingFAQ() {
    return (
        <Accordion type="single" collapsible className="max-w-2xl mx-auto divide-y divide-[#E8E2D8]">
            {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-none">
                    <AccordionTrigger className="font-medium text-[#1A1A1D] text-left hover:no-underline hover:text-[#C1502E] transition-colors">
                        {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#52525B] text-sm leading-relaxed pb-4">
                        {faq.answer}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
