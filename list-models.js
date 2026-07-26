import dotenv from "dotenv";
dotenv.config();

async function main() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        console.log("Models:", JSON.stringify(data.models?.map(m => m.name) || data, null, 2));
    } catch(e) {
        console.error(e);
    }
}
main();
