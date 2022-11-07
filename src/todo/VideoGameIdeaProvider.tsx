import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { VideoGameIdeaProps } from './VideoGameIdeaProps';
import { createVideoGameIdea, getVideoGameIdea, newWebSocket, updateVideoGameIdea } from './videoGameIdeaApi';

const log = getLogger('VideoGameIdeaProvider');

type SaveVideoGameIdeaFn = (item: VideoGameIdeaProps) => Promise<any>;

export interface VideoGameIdeasState {
  items?: VideoGameIdeaProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveVideoGameIdea?: SaveVideoGameIdeaFn,
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: VideoGameIdeasState = {
  fetching: false,
  saving: false,
};

const FETCH_VIDEO_GAME_IDEAS_STARTED = 'FETCH_VIDEO_GAME_IDEAS_STARTED';
const FETCH_VIDEO_GAMES_IDEAS_SUCCEEDED = 'FETCH_VIDEO_GAMES_IDEAS_SUCCEEDED';
const FETCH_VIDEO_GAME_IDEAS_FAILED = 'FETCH_VIDEO_GAME_IDEAS_FAILED';
const SAVE_VIDEO_GAME_IDEA_STARTED = 'SAVE_VIDEO_GAME_IDEA_STARTED';
const SAVE_VIDEO_GAME_IDEA_SUCCEEDED = 'SAVE_VIDEO_GAME_IDEA_SUCCEEDED';
const SAVE_VIDEO_GAME_IDEA_FAILED = 'SAVE_VIDEO_GAME_IDEA_FAILED';

const reducer: (state: VideoGameIdeasState, action: ActionProps) => VideoGameIdeasState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_VIDEO_GAME_IDEAS_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_VIDEO_GAMES_IDEAS_SUCCEEDED:
        return { ...state, items: payload.items, fetching: false };
      case FETCH_VIDEO_GAME_IDEAS_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_VIDEO_GAME_IDEA_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_VIDEO_GAME_IDEA_SUCCEEDED:
        const videoGamesIdeas = [...(state.items || [])];
        const item = payload.item;
        const index = videoGamesIdeas.findIndex(it => it.id === item.id);
        if (index === -1) {
          videoGamesIdeas.splice(0, 0, item);
        } else {
          videoGamesIdeas[index] = item;
        }
        return { ...state, items: videoGamesIdeas, saving: false };
      case SAVE_VIDEO_GAME_IDEA_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      default:
        return state;
    }
  };

export const ItemContext = React.createContext<VideoGameIdeasState>(initialState);

interface VideoGameIdeaProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const VideoGameIdeaProvider: React.FC<VideoGameIdeaProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { items: videoGameIdeas, fetching, fetchingError, saving, savingError } = state;
  useEffect(getVideoGameIdeaEffect, []);
  useEffect(wsEffect, []);
  const saveVideoGameIdea = useCallback<SaveVideoGameIdeaFn>(saveVideoGameIdeaCallback, []);
  const value = { items: videoGameIdeas, fetching, fetchingError, saving, savingError, saveItem: saveVideoGameIdea };
  log('returns');
  return (
    <ItemContext.Provider value={value}>
      {children}
    </ItemContext.Provider>
  );

  function getVideoGameIdeaEffect() {
    let canceled = false;
    fetchVideoGameIdeas();
    return () => {
      canceled = true;
    }

    async function fetchVideoGameIdeas() {
      try {
        log('fetchVideoGameIdeas started');
        dispatch({ type: FETCH_VIDEO_GAME_IDEAS_STARTED });
        const items = await getVideoGameIdea();
        log('fetchVideoGameIdeas succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_VIDEO_GAMES_IDEAS_SUCCEEDED, payload: { items } });
        }
      } catch (error) {
        log('fetchVideoGameIdeas failed');
        dispatch({ type: FETCH_VIDEO_GAME_IDEAS_FAILED, payload: { error } });
      }
    }
  }

  async function saveVideoGameIdeaCallback(item: VideoGameIdeaProps) {
    try {
      log('saveVideoGameIdea started');
      dispatch({ type: SAVE_VIDEO_GAME_IDEA_STARTED });
      const savedItem = await (item.id ? updateVideoGameIdea(item) : createVideoGameIdea(item));
      log('saveVideoGameIdea succeeded');
      dispatch({ type: SAVE_VIDEO_GAME_IDEA_SUCCEEDED, payload: { item: savedItem } });
    } catch (error) {
      log('saveVideoGameIdea failed');
      dispatch({ type: SAVE_VIDEO_GAME_IDEA_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    const closeWebSocket = newWebSocket(message => {
      if (canceled) {
        return;
      }
      const { event, payload: { item }} = message;
      log(`ws message, videoGameIdea ${event}`);
      if (event === 'created' || event === 'updated') {
        dispatch({ type: SAVE_VIDEO_GAME_IDEA_SUCCEEDED, payload: { item } });
      }
    });
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket();
    }
  }
};
