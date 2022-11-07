import axios from 'axios';
import { getLogger } from '../core';
import { VideoGameIdeaProps } from './VideoGameIdeaProps';

const log = getLogger('videoGameIdeaApi');

const baseUrl = 'localhost:3000';
const videoGameIdeaUrl = `http://${baseUrl}/videoGameIdea`;

interface ResponseProps<T> {
  data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
  log(`${fnName} - started`);
  return promise
    .then(res => {
      log(`${fnName} - succeeded`);
      return Promise.resolve(res.data);
    })
    .catch(err => {
      log(`${fnName} - failed`);
      return Promise.reject(err);
    });
}

const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};

export const getVideoGameIdea: () => Promise<VideoGameIdeaProps[]> = () => {
  return withLogs(axios.get(videoGameIdeaUrl, config), 'getVideoGameIdeas');
}

export const createVideoGameIdea: (item: VideoGameIdeaProps) => Promise<VideoGameIdeaProps[]> = videoGameIdea => {
  return withLogs(axios.post(videoGameIdeaUrl, videoGameIdea, config), 'createVideoGameIdeas');
}

export const updateVideoGameIdea: (videoGameIdea: VideoGameIdeaProps) => Promise<VideoGameIdeaProps[]> = videoGameIdea => {
  return withLogs(axios.put(`${videoGameIdeaUrl}/${videoGameIdea.id}`, videoGameIdea, config), 'updateVideoGameIdea');
}

interface MessageData {
  event: string;
  payload: {
    item: VideoGameIdeaProps;
  };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`)
  ws.onopen = () => {
    log('web socket onopen');
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}
