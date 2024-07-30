
interface QAPair {
    question: string;
    answer: string;
}

export class CustomerService {
    private qaPairs: QAPair[];

    constructor() {
        // Define your QA pairs here
        this.loadQAPairs();
    }
    async loadQAPairs() {
        try {
            const qaPairsModule = await import('../public/assets/text.json');
            this.qaPairs=  qaPairsModule.qa_pairs; // Assuming the JSON structure matches the QAPair[] type
            console.log(this.qaPairs);            
        } catch (error) {
            console.error('Failed to load QA pairs:', error);            
        }
    }

    public getAnswer(question: string): string | undefined {
        // Find the answer corresponding to the question
        console.log('Failed to load QA pairs:',this.qaPairs);  
        const qaPair = this.qaPairs?.find(qa => qa.question.includes(question));
        console.log(qaPair);
        // Return the answer if found, otherwise return undefined
        return qaPair ? qaPair.answer : undefined;
    }
}



// // Example usage:
// const customerService = new CustomerService();
// const question = "How can I reset my password?";
// const answer = customerService.getAnswer(question);

// if (answer) {
//     console.log(`Question: ${question}`);
//     console.log(`Answer: ${answer}`);
// } else {
//     console.log(`Sorry, we couldn't find an answer to your question.`);
// }
