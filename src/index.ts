import { ElevenLabsClient, play } from 'elevenlabs';
import fs from 'fs';

async function main() {
    const elevenlabs = new ElevenLabsClient({
        apiKey: "YOUR_API_KEY"
    });

    // 1. Create a pronunciation dictionary from an XML file with the words "tomato" and "Tomato"
    const xmlFile = fs.createReadStream("path/to/your/xml_file.xml");
    const createDictResponse = await elevenlabs.pronunciationDictionary.create({
        file: xmlFile,
        name: "TomatoPronunciationDictionary",
        description: "Dictionary for tomato pronunciation"
    });

    // 2. Generate the audio for the word "tomato" with the voice Rachel and call `await play` function
    let audio = await elevenlabs.generate({
        voice: "Rachel",
        text: "tomato",
        model_id: "eleven_multilingual_v2",
        pronunciation_dictionary_locators: [
            {
                pronunciation_dictionary_id: createDictResponse.id,
                version_id: createDictResponse.version_id
            }
        ]
    });

    await play(audio);

    // 3. Remove the "tomato" rules from the pronunciation dictionary
    await elevenlabs.pronunciationDictionary.removeRulesFromThePronunciationDictionary(createDictResponse.id, {
        rule_strings: ["tomato", "Tomato"]
    });

    // 4. Generate the audio for the word "tomato" without the pronunciation rules and call `await play` function
    audio = await elevenlabs.generate({
        voice: "Rachel",
        text: "tomato",
        model_id: "eleven_multilingual_v2"
    });

    await play(audio);

    // 5. Add again the "tomato" rules to the pronunciation dictionary using their phonemes
    const rulesAdditionResponse = await elevenlabs.pronunciationDictionary.addRulesToThePronunciationDictionary(createDictResponse.id, {
        rules: [
            {
                string_to_replace: "tomato",
                type: "phoneme",
                phoneme: "təˈmɑːtoʊ",
                alphabet: "ipa"
            },
            {
                string_to_replace: "Tomato",
                type: "phoneme",
                phoneme: "təˈmɑːtoʊ",
                alphabet: "ipa"
            }
        ]
    });

    // 6. Generate the audio for the word "tomato" with the updated pronunciation dictionary and call `await play` function
    audio = await elevenlabs.generate({
        voice: "Rachel",
        text: "tomato",
        model_id: "eleven_multilingual_v2",
        pronunciation_dictionary_locators: [
            {
                pronunciation_dictionary_id: createDictResponse.id,
                version_id: rulesAdditionResponse.version_id
            }
        ]
    });

    await play(audio);
}

main().catch(console.error);
