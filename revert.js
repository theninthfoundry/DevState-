const fs = require('fs');
let code = fs.readFileSync('src/components/SupremeOSControlPanel.tsx', 'utf8');

if (code.includes('onboarding')) {
  code = code.replace(/<'engines' \| 'pricing' \| 'onboarding' \| 'project'>/g, "<'engines' | 'pricing'>");
  
  const compassPattern = /<button[^>]*>[\s\S]*?<Compass[\s\S]*?<\/button>\s*<button[^>]*>[\s\S]*?<Layers[\s\S]*?<\/button>\s*(<button\n\s*onClick=\{\(\) => \{ setActiveTab\('engines'\); playClick\(1\.0\); \}\})/m;
  
  code = code.replace(compassPattern, '$1');

  const onboardingPattern = /\s*\) : activeTab === 'onboarding' \? \([\s\S]*?\) : activeTab === 'project' \? \([\s\S]*?\) : activeTab === 'pricing' \? \(/m;
  code = code.replace(onboardingPattern, '\n      ) : activeTab === \'pricing\' ? (');

  fs.writeFileSync('src/components/SupremeOSControlPanel.tsx', code);
  console.log('Reverted SupremeOSControlPanel');
}
