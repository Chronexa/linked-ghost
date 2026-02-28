import * as fs from 'fs';
import * as path from 'path';

function findRouteTsFiles(dir: string, fileList: string[] = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            findRouteTsFiles(filePath, fileList);
        } else if (file === 'route.ts') {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const routes = findRouteTsFiles(path.join(process.cwd(), 'app', 'api'));
let count = 0;

for (const file of routes) {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes("export const dynamic = 'force-dynamic';") && !content.includes('export const dynamic = "force-dynamic";')) {
        
        // Find the last import statement
        const importMatch = content.match(/^import .*?;\n/gm);
        let insertPos = 0;
        
        if (importMatch) {
            const lastImport = importMatch[importMatch.length - 1];
            insertPos = content.lastIndexOf(lastImport) + lastImport.length;
        }

        content = content.slice(0, insertPos) + "\nexport const dynamic = 'force-dynamic';\n" + content.slice(insertPos);
        fs.writeFileSync(file, content);
        count++;
    }
}
console.log(`Updated ${count} files.`);
