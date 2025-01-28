import React, { useState, useEffect } from "react";
import "./styles.css";

function Square({ value, onSquareClick, highlight }) {
  return (
    <button
      className={`square ${highlight ? "highlight" : ""}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ squares, onSquareClick, winningLine }) {
  const renderSquare = (i) => {
    const highlight = winningLine && winningLine.includes(i);
    return (
      <Square
        key={i}
        value={squares[i]}
        onSquareClick={() => onSquareClick(i)}
        highlight={highlight}
      />
    );
  };

  const boardRows = [];
  for (let row = 0; row < 3; row++) {
    const boardCols = [];
    for (let col = 0; col < 3; col++) {
      boardCols.push(renderSquare(row * 3 + col));
    }
    boardRows.push(
      <div key={row} className="board-row">
        {boardCols}
      </div>
    );
  }

  return <>{boardRows}</>;
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAI, setIsAI] = useState(false);
  const [aiTurn, setAITurn] = useState(false);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  useEffect(() => {
    if (isAI && !xIsNext && !calculateWinner(currentSquares) && aiTurn) {
      const aiMove = getBestMove(currentSquares);
      handleClick(aiMove);
      setAITurn(false);
    }
  }, [isAI, xIsNext, currentSquares, aiTurn]);

  const handleClick = (i) => {
    if (calculateWinner(currentSquares) || currentSquares[i]) {
      return;
    }
    const nextSquares = currentSquares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
    if (isAI && xIsNext) {
      setAITurn(true);
    }
  };

  const jumpTo = (move) => {
    setCurrentMove(move);
    setAITurn(false);
  };

  const resetGame = () => {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setAITurn(false);
  };

  const handleModeChange = (event) => {
    setIsAI(event.target.value === "ai");
    resetGame();
  };

  const winnerInfo = calculateWinner(currentSquares);
  const winner = winnerInfo ? winnerInfo.winner : null;
  const winningLine = winnerInfo ? winnerInfo.line : null;
  const isBoardFull = currentSquares.every(Boolean);
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (isBoardFull) {
    status = "Draw";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  const moves = history.map((squares, move) => {
    const description = move ? "Go to move #" + move : "Go to game start";
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board
          squares={currentSquares}
          onSquareClick={handleClick}
          winningLine={winningLine}
        />
      </div>
      <div className="game-info">
        <div>{status}</div>
        <ol>{moves}</ol>
        <div>
          <label>
            <input
              type="radio"
              value="human"
              checked={!isAI}
              onChange={handleModeChange}
            />
            Human vs. Human
          </label>
          <label>
            <input
              type="radio"
              value="ai"
              checked={isAI}
              onChange={handleModeChange}
            />
            Human vs. AI
          </label>
        </div>
        <button onClick={resetGame}>Reset Game</button>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
}

function getBestMove(squares) {
  const availableMoves = squares
    .map((square, index) => (square === null ? index : null))
    .filter((val) => val !== null);

  let bestMove;
  let bestValue = -Infinity;

  for (const move of availableMoves) {
    squares[move] = "O";
    const moveValue = minimax(squares, false);
    squares[move] = null;
    if (moveValue > bestValue) {
      bestValue = moveValue;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(squares, isMaximizing) {
  const winnerInfo = calculateWinner(squares);
  if (winnerInfo) {
    return winnerInfo.winner === "O" ? 1 : -1;
  }
  if (squares.every(Boolean)) {
    return 0;
  }

  const availableMoves = squares
    .map((square, index) => (square === null ? index : null))
    .filter((val) => val !== null);

  if (isMaximizing) {
    let bestValue = -Infinity;
    for (const move of availableMoves) {
      squares[move] = "O";
      const moveValue = minimax(squares, false);
      squares[move] = null;
      bestValue = Math.max(bestValue, moveValue);
    }
    return bestValue;
  } else {
    let bestValue = Infinity;
    for (const move of availableMoves) {
      squares[move] = "X";
      const moveValue = minimax(squares, true);
      squares[move] = null;
      bestValue = Math.min(bestValue, moveValue);
    }
    return bestValue;
  }
}
