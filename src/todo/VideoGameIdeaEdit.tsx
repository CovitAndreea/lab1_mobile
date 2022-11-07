import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { ItemContext } from './VideoGameIdeaProvider';
import { RouteComponentProps } from 'react-router';
import { VideoGameIdeaProps } from './VideoGameIdeaProps';

const log = getLogger('VideoGameIdeaEdit');

interface VideoGameItemEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const VideoGameIdeaEdit: React.FC<VideoGameItemEditProps> = ({ history, match }) => {
  const { items, saving, savingError, saveVideoGameIdea } = useContext(ItemContext);
  const [text, setText] = useState('');
  const [item, setVideoGameIdea] = useState<VideoGameIdeaProps>();
  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const item = items?.find(it => it.id === routeId);
    setVideoGameIdea(item);
    if (item) {
      setText(item.text);
    }
  }, [match.params.id, items]);
  const handleSave = useCallback(() => {
    const editedItem = item ? { ...item, text } : { text };
    saveVideoGameIdea && saveVideoGameIdea(editedItem).then(() => history.goBack());
  }, [item, saveVideoGameIdea, text, history]);
  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput value={text} onIonChange={e => setText(e.detail.value || '')} />
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save videoGameIdea'}</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default VideoGameIdeaEdit;
