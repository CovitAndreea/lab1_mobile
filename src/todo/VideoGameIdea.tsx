import React, { useCallback } from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { VideoGameIdeaProps } from './VideoGameIdeaProps';

interface VideoGameIdeaPropsExt extends VideoGameIdeaProps {
  onEdit: (id?: string) => void;
}

const VideoGameIdea: React.FC<VideoGameIdeaPropsExt> = ({ id, text, onEdit }) => {
  const handleEdit = useCallback(() => onEdit(id), [id, onEdit]);
  return (
    <IonItem onClick={handleEdit}>
      <IonLabel>{text}</IonLabel>
    </IonItem>
  );
};

export default VideoGameIdea;
