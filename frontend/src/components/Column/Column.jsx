import React, { forwardRef, useState } from 'react';
import { API } from 'Services/API';
import sprite from '../../assets/images/sprite.svg';
import TaskCard from '../TaskCard/TaskCard';
import AddCard from '../AddCard/AddCard';
import {
  AddCardButton,
  CardsList,
  ColumnHeader,
  ColumnTitle,
  ColumnWrapper,
  StyledIconButton,
} from './Column.styled';
import AddColumn from 'components/AddColumn/AddColumn';
import Loader from 'components/Loader';

import { Draggable} from 'react-beautiful-dnd';
import { StrictModeDroppable as Droppable } from 'helpers/StrictModeDroppable';



const Column = forwardRef(({ columnTitle, columnId, cards, columnData, isFetching, isDraggingOver, provided }, ref) => {
  const [deleteColumn] = API.useDeleteColumnByIdMutation();

  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isEditColumnOpen, setIsEditColumnOpen] = useState(false);

  const closeAddCard = () => setIsAddCardOpen(false);
  const handleClick = () => setIsAddCardOpen(true);

  const openEditColumn = () => setIsEditColumnOpen(true);
  const closeEditColumn = () => setIsEditColumnOpen(false);

  const handleDeleteColumn = async () => {
    try {
      await deleteColumn({ columnId });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Droppable droppableId={ columnId } type="CARD">
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
    <ColumnWrapper ref={provided.innerRef} {...provided.droppableProps}>
      <ColumnHeader>
        <ColumnTitle>{!isFetching ? columnTitle : (<Loader />)}</ColumnTitle>
        <div>
          <StyledIconButton onClick={openEditColumn} aria-label="edit">
            <svg
              stroke="var(--primary-text-color)"
              strokeOpacity="0.5"
              width="16"
              height="16"
            >
              <use href={sprite + '#icon-pencil'} />
            </svg>
          </StyledIconButton>
          <StyledIconButton onClick={handleDeleteColumn} aria-label="remove">
            <svg
              stroke="var(--primary-text-color)"
              strokeOpacity="0.5"
              width="16"
              height="16"
            >
              <use href={sprite + '#icon-trash'} />
            </svg>
          </StyledIconButton>
        </div>
      </ColumnHeader>
      <CardsList
      cols={cards}
      {...provided.droppableProps}
      ref={provided.innerRef}
      isDraggingOver={snapshot.isDraggingOver}
    >
            {cards?.map(({ title, description, priority, deadline, _id: id }, index) => {
              return (
                <Draggable draggableId={id} index={index} key={id}>
                  {(dragProvided) => (
                     <div
                {...dragProvided.draggableProps}
                {...dragProvided.dragHandleProps}
                ref={dragProvided.innerRef}
                draggable
              >
                      <TaskCard
                        key={id}
                        title={title}
                        description={description}
                        priority={priority}
                        deadline={deadline}
                        id={id}
                        columnId={columnId} 
                        dragHandleProps={dragProvided.dragHandleProps}
                      
                      />
                    </div>
                  )}
                </Draggable>
              );
            })}
           
             {provided.placeholder}
           </CardsList>
    
      <AddCardButton onClick={handleClick} title={'Add card'} />

      <AddCard
        columnId={columnId}
        modalType={'Add card'}
        open={isAddCardOpen}
        handleClose={closeAddCard}
        close={closeAddCard}
      />
      <AddColumn
        modalType={'Edit column'}
        open={isEditColumnOpen}
        columnId={columnId}
        close={closeEditColumn}
        titleValue={columnTitle}
        column={columnData}
            />
    {provided.placeholder}
      </ColumnWrapper>
      </div>
        )}
      </Droppable>
  );
});

export default React.memo(Column);