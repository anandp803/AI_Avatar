import axios, { AxiosResponse } from 'axios';

interface Payload {
  question: string;
  bot_id: string;
  history: any[];
  req_id: string;
  session_id: string;
  chat_mode: string;
}

export class KnowledgeGenieService {
  private url: string;
  private token: string;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  public async getResponse(payload: Payload): Promise<AxiosResponse<any>> {
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await axios.post(this.url, payload, { headers });
      return response;
    } catch (error) {
      console.error('Error making the request:', error);
      throw error;
    }
  }
}

// Usage example
const url = 'https://knowledgegenie.eastus.cloudapp.azure.com/api/v2/docs#/default/rag_search_stream_agents__agent_id__query_post';
const token = 'your_token_here';
const payload: Payload = {
  question: 'how to reset password',
  bot_id: '024116823e494c31bee0844d5dd74fd8',
  history: [],
  req_id: '',
  session_id: '',
  chat_mode: 'balanced'
};

const service = new KnowledgeGenieService(url, token);

service.getResponse(payload)
  .then(response => {
    console.log('Response:', response.data);
  });
