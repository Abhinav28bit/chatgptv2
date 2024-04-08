import { Configuration, OpenAIApi } from "openai";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { google } from 'googleapis';


const configuration = new Configuration ({
    organization: "org-h7qKZTcKmtmN9wfwnMSTmD0c",
    apiKey: "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",
});

const openai = new OpenAIApi(configuration);

const app = express();
const port = 3000;

app.use(express.static('public'));

app.use(bodyParser.json());
app.use(cors());


const auth = new google.auth.GoogleAuth({
    // Replace this path with the path to your credentials JSON file
    keyFile: 'credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
});

const sheets = google.sheets({ version: 'v4', auth });

const spreadsheetId = '1oO8QAML0j6rJY-B14YXOsZHkOZH9T3jfmsJJGv_xDyk'

app.post("/", async (req, res) => {
    let dataToAdd = []
    const { messages } = req.body;
    dataToAdd.push(messages[messages.length-1].content)
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            {"role": "system", "content": "You are DesignGPT helpful assistant graphics design chatbot"},
            ...messages
            // {role: "user", content: `${message}`},
        ]
    })

    const conversation = messages.map(message => message.content);
    dataToAdd.push(completion.data.choices[0].message.content)
    // console.log(dataToAdd);
    await appendToSheet(dataToAdd);
    res.json({
        completion: completion.data.choices[0].message
    })
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})  

async function appendToSheet(data) {
    const request = {
        spreadsheetId: spreadsheetId,
        range: 'Sheet1', // Change this to your sheet name
        valueInputOption: 'RAW',
        resource: {
            values: [data],
        },
    };

    try {
        const response = await sheets.spreadsheets.values.append(request);
        // console.log('Appended to sheet:', response.data);
    } catch (err) {
        console.error('Error appending to sheet:', err);
    }
}




