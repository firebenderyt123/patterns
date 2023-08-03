import type { DraggableProvided } from '@hello-pangea/dnd';
import React, { useContext } from 'react';

import type { Card } from '../../common/types';
import { CopyButton } from '../primitives/copy-button';
import { DeleteButton } from '../primitives/delete-button';
import { Splitter } from '../primitives/styled/splitter';
import { Text } from '../primitives/text';
import { Title } from '../primitives/title';
import { Container } from './styled/container';
import { Content } from './styled/content';
import { Footer } from './styled/footer';
import { SocketContext } from '../../context/socket';
import { CardEvent } from '../../common/enums';

type Props = {
  card: Card;
  isDragging: boolean;
  provided: DraggableProvided;
};

export const CardItem = ({ card, isDragging, provided }: Props) => {
  const socket = useContext(SocketContext);

  const renameCard = (name: string) => {
    socket.emit(CardEvent.RENAME, card.id, name);
  };

  const changeDescription = (description: string) => {
    socket.emit(CardEvent.CHANGE_DESCRIPTION, card.id, description);
  };

  const deleteCard = () => {
    socket.emit(CardEvent.DELETE, card.id);
  };

  const copyCard = () => {
    socket.emit(CardEvent.DUBLICATE, card.id);
  };

  return (
    <Container
      className="card-container"
      isDragging={isDragging}
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      data-is-dragging={isDragging}
      data-testid={card.id}
      aria-label={card.name}
    >
      <Content>
        <Title
          onChange={renameCard}
          title={card.name}
          fontSize="large"
          bold={true}
        />
        <Text text={card.description} onChange={changeDescription} />
        <Footer>
          <DeleteButton onClick={deleteCard} />
          <Splitter />
          <CopyButton onClick={copyCard} />
        </Footer>
      </Content>
    </Container>
  );
};
