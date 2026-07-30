const fs = require('fs');
const path = 'C:/Users/Samsung/.gemini/antigravity-ide/brain/92cf450f-3082-4c43-9538-7a1766402363/.system_generated/steps/43/output.txt';
const content = fs.readFileSync(path, 'utf8');
const data = JSON.parse(content);
const logs = data.result?.result || [];
console.log(`Total logs: ${logs.length}`);
logs.slice(0, 10).forEach((log, i) => {
  console.log(`--- Log ${i} ---`);
  console.log(JSON.stringify(log, null, 2));
});
