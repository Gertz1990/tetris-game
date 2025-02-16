import React, { useState, useEffect, useCallback } from 'react';

// Размеры игрового поля
const ROWS = 20;
const COLS = 10;
const CELL_SIZE = window.innerWidth < 600 ? Math.floor(window.innerWidth / COLS) : 30; // Адаптивный размер клетки

// Фигуры Тетриса и их возможные rotations
const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[0, 1, 1], [1, 1, 0]], // S
  [[1, 1, 0], [0, 1, 1]], // Z
];

// Начальное состояние игры
const initialState = {
  board: Array.from({ length: ROWS }, () => Array(COLS).fill(0)),
  shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
  position: { x: Math.floor(COLS / 2) - 1, y: 0 },
  score: 0,
  isGameOver: false,
};

const Tetris = () => {
  const [state, setState] = useState(initialState);

  // Генерация новой фигуры
  const spawnShape = () => {
    const newShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    setState((prev) => ({
      ...prev,
      shape: newShape,
      position: { x: Math.floor(COLS / 2) - 1, y: 0 },
    }));
  };

  // Проверка столкновений
  const checkCollision = (shape, position) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (
          shape[y][x] &&
          (position.y + y >= ROWS ||
            position.x + x < 0 ||
            position.x + x >= COLS ||
            state.board[position.y + y][position.x + x])
        ) {
          return true;
        }
      }
    }
    return false;
  };

  // Обновление игрового поля
  const updateBoard = useCallback(() => {
    const { shape, position, board } = state;

    // Если фигура достигла дна, фиксируем ее на поле
    if (checkCollision(shape, { x: position.x, y: position.y + 1 })) {
      const newBoard = board.map((row) => [...row]);
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x]) {
            newBoard[position.y + y][position.x + x] = 1;
          }
        }
      }

      // Проверяем заполненные линии
      const fullLines = [];
      for (let y = 0; y < ROWS; y++) {
        if (newBoard[y].every((cell) => cell === 1)) {
          fullLines.push(y);
        }
      }

      // Удаляем заполненные линии и добавляем новые сверху
      if (fullLines.length > 0) {
        fullLines.forEach((y) => {
          newBoard.splice(y, 1);
          newBoard.unshift(Array(COLS).fill(0));
        });
      }

      setState((prev) => ({
        ...prev,
        board: newBoard,
        score: prev.score + fullLines.length * 100,
      }));

      // Создаем новую фигуру
      spawnShape();
    } else {
      // Продолжаем движение фигуры вниз
      setState((prev) => ({
        ...prev,
        position: { x: prev.position.x, y: prev.position.y + 1 },
      }));
    }
  }, [state]);

  // Управление фигурой
  const handleKeyDown = useCallback(
    (e) => {
      const { position, shape } = state;
      if (e.key === 'ArrowLeft') {
        moveLeft();
      } else if (e.key === 'ArrowRight') {
        moveRight();
      } else if (e.key === 'ArrowDown') {
        moveDown();
      } else if (e.key === 'ArrowUp') {
        rotateShape();
      }
    },
    [state]
  );

  // Движение влево
  const moveLeft = () => {
    const { position, shape } = state;
    if (!checkCollision(shape, { x: position.x - 1, y: position.y })) {
      setState((prev) => ({
        ...prev,
        position: { x: prev.position.x - 1, y: prev.position.y },
      }));
    }
  };

  // Движение вправо
  const moveRight = () => {
    const { position, shape } = state;
    if (!checkCollision(shape, { x: position.x + 1, y: position.y })) {
      setState((prev) => ({
        ...prev,
        position: { x: prev.position.x + 1, y: prev.position.y },
      }));
    }
  };

  // Ускорение падения
  const moveDown = () => {
    updateBoard();
  };

  // Поворот фигуры
  const rotateShape = () => {
    const { shape, position } = state;
    const newShape = shape[0].map((_, i) => shape.map((row) => row[i]).reverse());
    if (!checkCollision(newShape, position)) {
      setState((prev) => ({
        ...prev,
        shape: newShape,
      }));
    }
  };

  // Игровой цикл
  useEffect(() => {
    const interval = setInterval(updateBoard, 1000);
    return () => clearInterval(interval);
  }, [updateBoard]);

  // Обработка нажатий клавиш
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Рендеринг игрового поля с текущей фигурой
  const renderBoard = () => {
    const { board, shape, position } = state;
    const displayBoard = board.map((row) => [...row]);

    // Добавляем текущую фигуру на поле
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          displayBoard[position.y + y][position.x + x] = 1;
        }
      }
    }

    return displayBoard;
  };

  return (
    <div style={{ textAlign: 'center', padding: '10px' }}>
      <h1>Tetris</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
          gap: '1px',
          backgroundColor: '#000',
          margin: '0 auto',
        }}
      >
        {renderBoard().map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                backgroundColor: cell ? '#f00' : '#fff',
              }}
            />
          ))
        )}
      </div>
      <div style={{ marginTop: '10px', fontSize: '20px' }}>Score: {state.score}</div>
      {state.isGameOver && <div style={{ color: 'red', fontSize: '24px' }}>Game Over!</div>}

      {/* Кнопки управления для мобильных устройств */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button
          onClick={moveLeft}
          style={{ fontSize: '24px', padding: '15px', borderRadius: '10px', border: 'none', background: '#007bff', color: '#fff' }}
        >
          ←
        </button>
        <button
          onClick={moveRight}
          style={{ fontSize: '24px', padding: '15px', borderRadius: '10px', border: 'none', background: '#007bff', color: '#fff' }}
        >
          →
        </button>
        <button
          onClick={moveDown}
          style={{ fontSize: '24px', padding: '15px', borderRadius: '10px', border: 'none', background: '#007bff', color: '#fff' }}
        >
          ↓
        </button>
        <button
          onClick={rotateShape}
          style={{ fontSize: '24px', padding: '15px', borderRadius: '10px', border: 'none', background: '#007bff', color: '#fff' }}
        >
          ↻
        </button>
      </div>
    </div>
  );
};

export default Tetris;