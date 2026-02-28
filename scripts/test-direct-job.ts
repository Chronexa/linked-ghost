import { linkedInImportJob, LinkedInImportJobData } from '../lib/queue/jobs/linkedin-import';
import { Job } from 'bullmq';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function runTest() {
    const mockJob = {
        id: `test-direct-run`,
        data: {
            userId: "user_3AHqNUZ7lKr6iaTKUOePnutKQnG",
            linkedinUrl: "https://www.linkedin.com/in/abhishek-walia-0710/",
            clerkId: "user_3AHqNUZ7lKr6iaTKUOePnutKQnG"
        }
    } as Job<LinkedInImportJobData>;

    console.log("Starting mock direct job...");
    await linkedInImportJob(mockJob);
    console.log("Mock Job Completed.");
    process.exit(0);
}
runTest().catch((err) => {
    console.error("Test failed with uncaught error:", err);
    process.exit(1);
});
