/**
 * scripts/verify-billing-flow.ts
 * Run: npx tsx scripts/verify-billing-flow.ts
 * 
 * End-to-end verification of the Razorpay billing flow.
 * Tests: environment vars, plan config resolution, DB schema, subscription state.
 * Does NOT make actual Razorpay API calls (use Razorpay test dashboard for that).
 */

import 'dotenv/config';
import { db } from '../lib/db';
import { subscriptions, usageTracking } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import { getPlanConfig, PLANS, FREE_TRIAL_LIMITS } from '../lib/config/plans.config';

type PlanId = 'starter' | 'growth';
type BillingInterval = 'monthly' | 'yearly';

const PASS = '✅';
const FAIL = '❌';
const WARN = '⚠️';

let failures = 0;

function check(label: string, condition: boolean, detail?: string) {
    if (condition) {
        console.log(`  ${PASS} ${label}${detail ? ` — ${detail}` : ''}`);
    } else {
        console.error(`  ${FAIL} ${label}${detail ? ` — ${detail}` : ''}`);
        failures++;
    }
}

function warn(label: string, detail?: string) {
    console.warn(`  ${WARN} ${label}${detail ? ` — ${detail}` : ''}`);
}

// ============================================================================
// 1. Environment Variables
// ============================================================================
async function checkEnvVars() {
    console.log('\n📋 1. Environment Variables');

    const required: Record<string, string | undefined> = {
        RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
        NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
        RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
        RAZORPAY_PLAN_STARTER_MONTHLY: process.env.RAZORPAY_PLAN_STARTER_MONTHLY,
        RAZORPAY_PLAN_STARTER_YEARLY: process.env.RAZORPAY_PLAN_STARTER_YEARLY,
        RAZORPAY_PLAN_GROWTH_MONTHLY: process.env.RAZORPAY_PLAN_GROWTH_MONTHLY,
        RAZORPAY_PLAN_GROWTH_YEARLY: process.env.RAZORPAY_PLAN_GROWTH_YEARLY,
    };

    for (const [key, value] of Object.entries(required)) {
        check(key, !!(value && value.trim() !== ''), value ? `"${value.slice(0, 12)}..."` : 'MISSING');
    }

    // Warn on test vs live mode
    const keyId = process.env.RAZORPAY_KEY_ID ?? '';
    if (keyId.startsWith('rzp_test_')) {
        warn('You are in RAZORPAY TEST MODE — do not go live with these keys');
    } else if (keyId.startsWith('rzp_live_')) {
        warn('You are in RAZORPAY LIVE MODE — real charges will be made');
    }
}

// ============================================================================
// 2. Plans Config Resolution
// ============================================================================
async function checkPlanConfig() {
    console.log('\n📋 2. Plan Config Resolution (plans.config.ts → env vars)');

    const planIds: PlanId[] = ['starter', 'growth'];
    const intervals: BillingInterval[] = ['monthly', 'yearly'];

    for (const planId of planIds) {
        for (const interval of intervals) {
            const config = getPlanConfig(planId);
            const rzpPlanId = config.razorpayPlanIds[interval];
            check(
                `PLANS.${planId}.razorpayPlanIds.${interval}`,
                !!(rzpPlanId && rzpPlanId.startsWith('plan_')),
                rzpPlanId ? rzpPlanId : 'EMPTY — set env var!'
            );
        }
    }

    // Check prices are sensible
    check('starter monthlyPriceUsd > 0', PLANS.starter.monthlyPriceUsd > 0);
    check('growth monthlyPriceUsd > starter', PLANS.growth.monthlyPriceUsd > PLANS.starter.monthlyPriceUsd);
    check('free trial limits set', FREE_TRIAL_LIMITS.postsPerMonth !== null && FREE_TRIAL_LIMITS.postsPerMonth > 0);
}

// ============================================================================
// 3. Database Schema Verification
// ============================================================================
async function checkDatabaseSchema() {
    console.log('\n📋 3. Database Schema & Connectivity');

    try {
        // Test subscriptions table is accessible
        const result = await db.select().from(subscriptions).limit(1);
        check('subscriptions table accessible', true, `found ${result.length} row(s)`);
    } catch (e: any) {
        check('subscriptions table accessible', false, e.message);
        return;
    }

    try {
        const result = await db.select().from(usageTracking).limit(1);
        check('usage_tracking table accessible', true, `found ${result.length} row(s)`);
    } catch (e: any) {
        check('usage_tracking table accessible', false, e.message);
    }
}

// ============================================================================
// 4. Subscription State Check
// ============================================================================
async function checkSubscriptionStates() {
    console.log('\n📋 4. Subscription State Sanity Check');

    const allSubs = await db.select().from(subscriptions);
    console.log(`  Found ${allSubs.length} total subscription(s) in DB`);

    const statuses = new Map<string, number>();
    for (const sub of allSubs) {
        statuses.set(sub.status, (statuses.get(sub.status) ?? 0) + 1);
    }

    for (const [status, count] of statuses) {
        console.log(`  • ${status}: ${count}`);
    }

    // Check for any subscriptions with missing Razorpay IDs (data integrity)
    const broken = allSubs.filter(s => !s.razorpaySubscriptionId || !s.razorpayCustomerId);
    check('All subscriptions have Razorpay IDs', broken.length === 0,
        broken.length > 0 ? `${broken.length} sub(s) missing Razorpay ID` : 'OK');

    // Check for any active/trialing subscriptions with missing planType
    const activeSubs = allSubs.filter(s => s.status === 'active' || s.status === 'trialing');
    console.log(`\n  Active/trialing subscriptions: ${activeSubs.length}`);
    for (const sub of activeSubs) {
        console.log(`  User ${sub.userId}: ${sub.planType} (${sub.billingInterval}) — status: ${sub.status}`);
        check(`  periodEnd in future for ${sub.userId.slice(0, 8)}`, new Date(sub.currentPeriodEnd) > new Date(),
            sub.currentPeriodEnd.toISOString());
    }
}

// ============================================================================
// 5. Usage Tracking Sanity
// ============================================================================
async function checkUsageTracking() {
    console.log('\n📋 5. Usage Tracking Records');

    const allUsage = await db.select().from(usageTracking);
    console.log(`  Found ${allUsage.length} usage tracking record(s)`);

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const thisMonth = allUsage.filter(u => u.month === currentMonth);
    console.log(`  Current month (${currentMonth}): ${thisMonth.length} record(s)`);

    for (const u of thisMonth) {
        console.log(`  User ${u.userId.slice(0, 8)}: posts=${u.postsGenerated}, regens=${u.regenerationsUsed}, topics=${u.topicsClassified}`);
    }
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
    console.log('🧪 ContentPilot AI — Billing Flow Verification');
    console.log('================================================');

    await checkEnvVars();
    await checkPlanConfig();
    await checkDatabaseSchema();
    await checkSubscriptionStates();
    await checkUsageTracking();

    console.log('\n================================================');
    if (failures === 0) {
        console.log('✅ All checks passed! Ready to test Razorpay checkout.');
    } else {
        console.error(`❌ ${failures} check(s) failed. Fix these before testing payments.`);
        process.exit(1);
    }
}

main().catch(console.error);
