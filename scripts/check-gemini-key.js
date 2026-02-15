/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local manually since we don't want to rely on dotenv package overlapping
const envPath = path.join(__dirname, '..', '.env.local');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
    if (match) {
        apiKey = match[1].trim();
    }
} catch {
    console.error("Could not read .env.local");
    process.exit(1);
}

if (!apiKey) {
    console.error("API Key not found in .env.local");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log(`Checking API Key permissions...`);
console.log(`Endpoint: ${url.replace(apiKey, 'HIDDEN_KEY')}`);

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", JSON.stringify(json.error, null, 2));
            } else {
                console.log("Success! API Key is valid.");
                console.log("Available Models (filtering for 'flash' or 'tts'):");
                const models = json.models || [];
                const relevant = models.filter(m => m.name.includes('flash') || m.name.includes('tts') || m.name.includes('gemini-2.0'));
                relevant.forEach(m => console.log(`- ${m.name}`));

                // Check specifically for our target model
                const target = 'gemini-2.5-flash-preview-tts';
                const found = models.find(m => m.name.endsWith(target));
                if (found) {
                    console.log(`\n✅ Model '${target}' IS available!`);
                } else {
                    console.log(`\n❌ Model '${target}' is NOT in the list.`);
                    console.log("This confirms the key does not have access to the preview TTS model, or the model name is different.");
                }
            }
        } catch {
            console.error("Failed to parse response:", data);
        }
    });
}).on('error', err => {
    console.error("Request failed:", err.message);
});
