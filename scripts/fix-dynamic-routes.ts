import * as fs from 'fs';
import * as glob from 'glob';

const files = glob.sync('app/api/**/route.ts', { absolute: true });
let updatedCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes("export const dynamic = 'force-dynamic';") && !content.includes('export const dynamic = "force-dynamic";')) {
        // Add export const dynamic = 'force-dynamic'; after imports or at top
        const importMatch = content.match(/^import .*?;\n/gm);
        let insertPos = 0;
        
        if (importMatch) {
            const lastImport = importMatch[importMatch.length - 1];
            insertPos = content.lastIndexOf(lastImport) + lastImport.length;
        }

        content = content.slice(0, insertPos) + "\nexport const dynamic = 'force-dynamic';\n\n" + content.slice(insertPos);
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
        updatedCount++;
    }
}
console.log(`Updated ${updatedCount} API routes with force-dynamic.`);
