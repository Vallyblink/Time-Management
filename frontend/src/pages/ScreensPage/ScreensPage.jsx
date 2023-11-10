import React, { useEffect, useState } from 'react';
import { ButtonAdd } from 'components/Buttons/Button';
import AddColumn from 'components/AddColumn/AddColumn';
import Column from '../../components/Column/Column';
import { HeaderDashboard } from 'components/HeaderDashboard/HeaderDashboard';
import { API } from 'Services/API';
import { useParams } from 'react-router-dom';
import {
  MainWrapper,
  ColumnsWrapper,
  MainContainer,
} from './ScreenPage.styled';
import { useDispatch, useSelector } from 'react-redux';
import Loader from 'components/Loader';
import { DragDropContext } from 'react-beautiful-dnd';
import { StrictModeDroppable as Droppable } from 'helpers/StrictModeDroppable';

const ScreensPage = () => {
  const { boardId } = useParams();
  const [filterValue, setFilterValue] = useState('');
  const stateFilter = useSelector(state => state.boards.filter);
  const dispatch = useDispatch();
  const [CardByColumn] = API.useUpdateCardColumnByIdMutation();

  const reqData = {
    id: boardId,
    filter: filterValue,
  };
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);

  const { data, isFetching } = API.useGetBoardContentByIdQuery(
    reqData,
    {
      refetchOnMountOrArgChange: true,
      // skip: false,
    }
  );

  console.log('data :>> ', data);

  const openAddColumn = () => setIsAddColumnOpen(true);
  const closeAddColumn = () => setIsAddColumnOpen(false);

  const [columnsData, setColumnsData] = useState([]);
  const [columnIndices, setColumnIndices] = useState({});

  useEffect(() => {
    if (data?.content) {
      const initialIndices = {};
      data.content.forEach((column, columnIndex) => {
        column.cards.forEach((card, cardIndex) => {
          initialIndices[card._id] = {
            column: columnIndex,
            card: cardIndex,
          };
        });
      });
      setColumnIndices(initialIndices);
      setColumnsData(data.content); // Оновлення локальних даних з сервера
    }
  }, [data]);

  useEffect(() => {
    setFilterValue(stateFilter);
    if (stateFilter === '0') {
      setFilterValue('');
    } else {
      setFilterValue(stateFilter);
    }
  }, [dispatch, stateFilter]);

  const moveCardToAnotherColumn = async (cardId, newColumnId) => {
    console.log(cardId);
    console.log(newColumnId)
    try {
      const response = await CardByColumn(cardId, { newOwnerId: newColumnId });

      if (response === 'Card moved') {
        
        setColumnsData(prevColumnsData => {
          const updatedColumnsData = [...prevColumnsData];
          const sourceColumnIndex = columnIndices[cardId].column;
          const sourceCardIndex = columnIndices[cardId].card;

          if (updatedColumnsData[sourceColumnIndex]) {
            const movedCard = updatedColumnsData[sourceColumnIndex].cards.splice(
              sourceCardIndex,
              1
            )[0];

            const destinationColumnIndex = updatedColumnsData.findIndex(
              column => column._id === newColumnId
            );

            if (updatedColumnsData[destinationColumnIndex]) {
              // Додайте картку в нову колонку
              updatedColumnsData[destinationColumnIndex].cards.push(movedCard);

              // Оновіть індекси картки
              const updatedIndices = { ...columnIndices };
              updatedIndices[cardId] = {
                column: destinationColumnIndex,
                card: updatedColumnsData[destinationColumnIndex].cards.length - 1,
              };
              setColumnIndices(updatedIndices);
            }
          }

          return updatedColumnsData;
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <MainWrapper index={data?.background}>
      <MainContainer>
        <HeaderDashboard filter={setFilterValue} title={data?.title} />
        <DragDropContext
          onDragEnd={result => {
            // Обробка переміщення карток
            if (!result.destination) {
              return; // Переміщення не відбулося
            }

            // Отримайте ID карти та ID нової колонки
            const cardId = result.draggableId;
            const newColumnId = result.destination.droppableId.split('-')[1];

            // Викликайте функцію переміщення картки
            moveCardToAnotherColumn(cardId, newColumnId);
          }}
        >
          <Droppable droppableId="columnId" key="columnId">
            {(provided) => (
              <ColumnsWrapper
                cols={!columnsData ? 1 : columnsData?.length + 1}
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {!isFetching ? (
                  columnsData?.map(
                    ({ _id: columnId, title: columnTitle, cards }, index) => (
                      <Column
                        isFetching={isFetching}
                        key={columnId}
                        columnData={columnsData[index]}
                        columnTitle={columnTitle}
                        columnId={columnId}
                        cards={cards}
                      />
                    )
                  )
                ) : (
                  <Loader />
                )}

                <ButtonAdd onClick={openAddColumn}></ButtonAdd>
                {provided.placeholder}
              </ColumnsWrapper>
            )}
          </Droppable>
        </DragDropContext>

        {isAddColumnOpen ? (
          <AddColumn
            modalType={'Add column'}
            open={isAddColumnOpen}
            boardId={boardId}
            close={closeAddColumn}
          />
        ) : (
          <></>
        )}
      </MainContainer>
    </MainWrapper>
  );
};

export default ScreensPage;
