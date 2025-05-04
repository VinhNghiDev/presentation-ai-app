// src/hooks/useHistory.js
import { useState, useCallback } from 'react';

/**
 * Custom hook để quản lý lịch sử undo/redo
 * @param {any} initialState - Trạng thái ban đầu
 * @param {number} maxHistory - Số lượng tối đa lịch sử được lưu trữ
 * @returns {Object} - Các phương thức và thuộc tính để quản lý lịch sử
 */
export const useHistory = (initialState, maxHistory = 30) => {
  // State quản lý lịch sử, vị trí hiện tại và trạng thái
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [state, setState] = useState(initialState);
  
  // Lấy trạng thái hiện tại
  const current = history[currentIndex];
  
  // Kiểm tra có thể undo/redo không
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;
  
  /**
   * Thêm một trạng thái mới vào lịch sử
   * @param {any} newState - Trạng thái mới cần thêm vào lịch sử
   */
  const addToHistory = useCallback((newState) => {
    // Nếu trạng thái giống với trạng thái hiện tại thì không cần thêm
    if (JSON.stringify(newState) === JSON.stringify(current)) {
      return;
    }
    
    // Tạo lịch sử mới bằng cách xóa tất cả các trạng thái phía sau và thêm trạng thái mới
    const newHistory = [
      ...history.slice(0, currentIndex + 1),
      newState
    ];
    
    // Nếu lịch sử vượt quá giới hạn, loại bỏ các trạng thái cũ nhất
    if (newHistory.length > maxHistory) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    setState(newState);
  }, [history, currentIndex, current, maxHistory]);
  
  /**
   * Quay lại trạng thái trước đó (undo)
   * @returns {any} - Trạng thái trước đó
   */
  const undo = useCallback(() => {
    if (!canUndo) return current;
    
    const newIndex = currentIndex - 1;
    const previousState = history[newIndex];
    
    setCurrentIndex(newIndex);
    setState(previousState);
    
    return previousState;
  }, [history, currentIndex, canUndo, current]);
  
  /**
   * Tiến đến trạng thái tiếp theo (redo)
   * @returns {any} - Trạng thái tiếp theo
   */
  const redo = useCallback(() => {
    if (!canRedo) return current;
    
    const newIndex = currentIndex + 1;
    const nextState = history[newIndex];
    
    setCurrentIndex(newIndex);
    setState(nextState);
    
    return nextState;
  }, [history, currentIndex, canRedo, current]);
  
  /**
   * Reset lịch sử về trạng thái ban đầu
   * @param {any} newInitialState - Trạng thái ban đầu mới (tùy chọn)
   */
  const reset = useCallback((newInitialState = initialState) => {
    setHistory([newInitialState]);
    setCurrentIndex(0);
    setState(newInitialState);
  }, [initialState]);
  
  /**
   * Xóa toàn bộ lịch sử và thiết lập trạng thái mới
   * @param {any} newState - Trạng thái mới
   */
  const clear = useCallback((newState) => {
    setHistory([newState]);
    setCurrentIndex(0);
    setState(newState);
  }, []);
  
  return {
    state,
    setState: addToHistory,
    history,
    undo,
    redo,
    canUndo,
    canRedo,
    addToHistory,
    reset,
    clear,
    historyIndex: currentIndex,
    historyLength: history.length
  };
};

export default useHistory;