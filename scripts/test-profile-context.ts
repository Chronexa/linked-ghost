import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { buildAuthorContext, buildSystemPrompt } from '../lib/ai/generation';
import { scoreGeneratedContent } from '../lib/ai/quality-metrics';
import { openai, DEFAULT_CONFIG } from '../lib/ai/openai';
import { interpolate, GENERATION_PROMPTS } from '../lib/prompts/generation-prompts';

// Mock Profile: Senior Product Manager
const TEST_PROFILE: any = {
    currentRole: 'Senior Product Lead',
    industry: 'B2B SaaS',
    yearsOfExperience: '12',
    keyExpertise: ['Product-Led Growth', 'Pricing Strategy', 'Enterprise Sales', 'Churn Reduction'],
    uniqueAngle: 'Build for power users first',
    companyName: 'ScaleUp Inc',
};

// Test Topic
const TOPIC = {
    title: 'Usage-Based Pricing Models',
    description: 'Why per-seat pricing is dying and usage-based is the future for PLG.',
    pillarName: 'Growth Strategy',
    pillarDescription: 'Deep dives into growth levers for B2B startups.',
    pillarTone: 'Analytical, contrarian, authoritative',
    targetAudience: 'SaaS Founders and Heads of Growth',
};

async function generateVariant(systemPrompt: string, userPrompt: string, label: string) {
    console.log(`\n🤖 Generating ${label} variant...`);
    const startTime = Date.now();

    const response = await openai.chat.completions.create({
        model: DEFAULT_CONFIG.generation.model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
    });

    const duration = Date.now() - startTime;
    const content = JSON.parse(response.choices[0].message.content || '{}');
    const variant = content.variants?.[0] || content; // Handle potentially different structure

    return {
        text: variant.fullText || variant.body,
        duration
    };
}

async function runTest() {
    console.log('🧪 STARTING PROFILE INTELLIGENCE A/B TEST');
    console.log('========================================');
    console.log(`Topic: ${TOPIC.title}`);
    console.log(`Profile: ${TEST_PROFILE.currentRole} in ${TEST_PROFILE.industry}`);

    // 1. Build Prompts
    // Baseline (No Author Context)
    const baselineSystemPrompt = buildSystemPrompt({
        pillarName: TOPIC.pillarName,
        pillarDescription: TOPIC.pillarDescription,
        pillarTone: TOPIC.pillarTone,
        targetAudience: TOPIC.targetAudience,
        numVariants: 1,
        authorContext: '', // EMPTY
    });

    // Treatment (With Author Context)
    const authorContext = buildAuthorContext({ profile: TEST_PROFILE, mode: 'full' });
    const treatmentSystemPrompt = buildSystemPrompt({
        pillarName: TOPIC.pillarName,
        pillarDescription: TOPIC.pillarDescription,
        pillarTone: TOPIC.pillarTone,
        targetAudience: TOPIC.targetAudience,
        numVariants: 1,
        authorContext: authorContext, // INJECTED
    });

    const userPrompt = `**TOPIC:** ${TOPIC.title}\n${TOPIC.description}\n\nGenerate 1 variant.`;

    // 2. Generate
    const baseline = await generateVariant(baselineSystemPrompt, userPrompt, 'BASELINE');
    const treatment = await generateVariant(treatmentSystemPrompt, userPrompt, 'TREATMENT');

    // 3. Score
    const baselineScore = scoreGeneratedContent(baseline.text, null);
    const treatmentScore = scoreGeneratedContent(treatment.text, TEST_PROFILE);

    // 4. Report
    console.log('\n📊 RESULTS COMPARISON');
    console.log('========================================');

    console.log('\n--- BASELINE (Generic) ---');
    console.log(`Time: ${baseline.duration}ms`);
    console.log(`Specificity: ${baselineScore.specificityScore}/100`);
    console.log(`Credibility: ${baselineScore.credibilityScore}/100`);
    console.log(`Clichés: ${baselineScore.clicheCount}`);
    console.log(`Overall: ${baselineScore.overallScore}/100`);
    console.log('\nExcerpt:\n', baseline.text.slice(0, 200) + '...');

    console.log('\n--- TREATMENT (Profile-Aware) ---');
    console.log(`Time: ${treatment.duration}ms`);
    console.log(`Specificity: ${treatmentScore.specificityScore}/100`);
    console.log(`Credibility: ${treatmentScore.credibilityScore}/100`);
    console.log(`Clichés: ${treatmentScore.clicheCount}`);
    console.log(`Overall: ${treatmentScore.overallScore}/100`);
    console.log('\nExcerpt:\n', treatment.text.slice(0, 200) + '...');

    console.log('\n\n🏆 VERDICT:');
    const delta = treatmentScore.overallScore - baselineScore.overallScore;
    if (delta > 0) {
        console.log(`Treatment WON by +${delta} points.`);
        if (delta >= 20) console.log('✅ SUCCESS CRITERIA MET (>20 points improvement)');
        else console.log('⚠️ IMPROVEMENT DETECTED BUT BELOW TARGET (20 points)');
    } else {
        console.log(`Treatment LOST by ${delta} points.`);
        console.log('❌ FAILED: Quality regressed.');
    }
}

runTest().catch(console.error);
