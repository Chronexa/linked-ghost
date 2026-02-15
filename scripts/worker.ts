import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables immediately
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log('👷 Starting Background Workers...');

    // Dynamic import to ensure env vars are loaded first
    try {
        const { initAllWorkers } = await import('@/lib/queue/worker');
        initAllWorkers();
        console.log('✅ Workers initialized and listening for jobs...');

        // Keep process alive
        process.on('SIGTERM', () => {
            console.log('🛑 SIGTERM received, shutting down workers...');
            process.exit(0);
        });

        process.on('SIGINT', () => {
            console.log('🛑 SIGINT received, shutting down workers...');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Failed to start workers:', error);
        process.exit(1);
    }
}

main().catch(console.error);
