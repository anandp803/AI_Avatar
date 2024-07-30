// import {OpenAI} from "openai";


// export class OpenAI {
//     // private apiKey: string;

//     // constructor(apiKey: string) {
//     //     this.apiKey = apiKey;  //sk-proj-k3ZMBOsde78cGLeqE2LHT3BlbkFJC2YN8PUJP1znO36DgawU
//     // }

//     // public async getResponse(prompt: string): Promise<string> {
//     //     const response = await fetch("https://api.openai.com/v1/completions", {
//     //         method: "POST",
//     //         headers: {
//     //             "Content-Type": "application/json",
//     //             "Authorization": `Bearer ${this.apiKey}`
//     //         },
//     //         body: JSON.stringify({
//     //             prompt: prompt,
//     //             max_tokens: 150
//     //         })
//     //     });

//     //     const data = await response.json();
//     //     return data.choices[0].text.trim();
//     // }

//     const openai = new OpenAI();
//     async function main() {
//         const stream = await openai.chat.completions.create({
//             model: "gpt-3.5-turbo",
//             messages: [{ role: "user", content: "Say this is a test" }],
//             stream: true,
//         });
//         for await (const chunk of stream) {
//             process.stdout.write(chunk.choices[0]?.delta?.content || "");
//         }
// }
// }

