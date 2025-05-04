import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { TableRenderer } from './TableEditor';

const SlideEditor = ({ currentSlide, updateSlide }) => {
  const [elements, setElements] = useState(currentSlide.elements || []);
  const [showTableEditor, setShowTableEditor] = useState(false);
  const [editingElementIndex, setEditingElementIndex] = useState(null);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(elements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setElements(items);
    updateSlide({ ...currentSlide, elements: items });
  };

  const addElement = (type) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type,
      content: type === 'text' ? 'Văn bản mới' : '',
      position: { x: 50, y: 50 },
      size: { width: 200, height: type === 'text' ? 100 : 150 }
    };
    
    const newElements = [...elements, newElement];
    setElements(newElements);
    updateSlide({ ...currentSlide, elements: newElements });
  };

  const handleEditElement = (index) => {
    if (elements[index].type === 'table') {
      setShowTableEditor(true);
      setEditingElementIndex(index);
    }
  };

  const renderElements = () => {
    if (!currentSlide || !currentSlide.elements) return null;
    
    return currentSlide.elements.map((element, index) => {
      let elementContent;
      switch (element.type) {
        case 'text':
          elementContent = (
            <textarea
              className="form-control h-100 border-0"
              value={element.content}
              onChange={(e) => {
                const newElements = [...elements];
                newElements[index].content = e.target.value;
                setElements(newElements);
                updateSlide({ ...currentSlide, elements: newElements });
              }}
            />
          );
          break;
        case 'image':
          elementContent = (
            <div className="bg-light d-flex justify-content-center align-items-center h-100">
              <span>Hình ảnh</span>
            </div>
          );
          break;
        case 'table':
          elementContent = (
            <TableRenderer 
              tableData={element.data}
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '100%',
                overflow: 'auto'
              }}
              onEdit={() => handleEditElement(index)}
            />
          );
          break;
        default:
          elementContent = null;
      }

      return (
        <Draggable key={element.id} draggableId={element.id} index={index}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className="element-item p-2 border rounded mb-2"
              style={{
                ...provided.draggableProps.style,
                position: 'absolute',
                left: `${element.position.x}px`,
                top: `${element.position.y}px`,
                width: `${element.size.width}px`,
                height: `${element.size.height}px`,
              }}
            >
              {elementContent}
            </div>
          )}
        </Draggable>
      );
    });
  };

  return (
    <div className="card h-100">
      <div className="card-body">
        <input
          type="text"
          className="form-control form-control-lg mb-3"
          placeholder="Tiêu đề slide"
          value={currentSlide.title || ''}
          onChange={(e) => updateSlide({ ...currentSlide, title: e.target.value })}
        />
        
        <div className="editor-canvas p-3 border rounded" style={{ minHeight: '500px', position: 'relative' }}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="slide-elements">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="h-100"
                >
                  {renderElements()}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default SlideEditor;