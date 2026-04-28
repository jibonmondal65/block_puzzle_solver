import React, { useState } from "react";

const N = 8;
const S = 5;

export default function App() {
  const emptyBoard = () =>
    Array.from({ length: N }, () => Array(N).fill(0));

  const emptyShape = () =>
    Array.from({ length: S }, () => Array(S).fill(0));

  const [board, setBoard] = useState(emptyBoard());

  const [shapes, setShapes] = useState([
    emptyShape(),
    emptyShape(),
    emptyShape()
  ]);

  const [solution, setSolution] = useState(null);

  // ========= TOGGLE =========

  const toggleBoard = (r, c) => {
    let b = board.map(row => [...row]);
    b[r][c] ^= 1;
    setBoard(b);
  };

  const toggleShape = (idx, r, c) => {
    let newShapes = shapes.map(s => s.map(row => [...row]));
    newShapes[idx][r][c] ^= 1;
    setShapes(newShapes);
  };

  // ========= TRIM SHAPE =========

  const trim = (grid) => {
    let top = S, bottom = -1, left = S, right = -1;

    for (let i = 0; i < S; i++) {
      for (let j = 0; j < S; j++) {
        if (grid[i][j]) {
          top = Math.min(top, i);
          bottom = Math.max(bottom, i);
          left = Math.min(left, j);
          right = Math.max(right, j);
        }
      }
    }

    if (bottom === -1) return [];

    let res = [];
    for (let i = top; i <= bottom; i++) {
      let row = [];
      for (let j = left; j <= right; j++) {
        row.push(grid[i][j]);
      }
      res.push(row);
    }
    return res;
  };

  // ========= SOLVER =========

  const clone = (b) => b.map(r => [...r]);

  const canPlace = (b, shape, r, c) => {
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          let nr = r + i;
          let nc = c + j;
          if (nr >= N || nc >= N || b[nr][nc]) return false;
        }
      }
    }
    return true;
  };

  const clearLines = (b) => {
    let nb = clone(b);

    // clear rows
    for (let i = 0; i < N; i++) {
      if (nb[i].every(v => v === 1)) {
        for (let j = 0; j < N; j++) nb[i][j] = 0;
      }
    }

    // clear columns
    for (let j = 0; j < N; j++) {
      let full = true;
      for (let i = 0; i < N; i++) {
        if (!nb[i][j]) full = false;
      }
      if (full) {
        for (let i = 0; i < N; i++) nb[i][j] = 0;
      }
    }

    return nb;
  };

  const place = (b, shape, r, c) => {
    let nb = clone(b);

    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j]) {
          nb[r + i][c + j] = 1;
        }
      }
    }

    return clearLines(nb);
  };

  // permutations with identity preserved
  const permute = (arr) => {
    if (arr.length === 0) return [[]];
    let res = [];

    for (let i = 0; i < arr.length; i++) {
      let rest = permute(arr.slice(0, i).concat(arr.slice(i + 1)));
      for (let r of rest) {
        res.push([arr[i], ...r]);
      }
    }

    return res;
  };

  const dfs = (b, shapes, idx, moves) => {
    if (idx === shapes.length) return moves;

    let current = shapes[idx];

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (canPlace(b, current.shape, i, j)) {
          let nb = place(b, current.shape, i, j);

          let res = dfs(nb, shapes, idx + 1, [
            ...moves,
            { shape: current.id, row: i, col: j }
          ]);

          if (res) return res;
        }
      }
    }

    return null;
  };

  const solve = () => {
    const indexedShapes = shapes.map((s, i) => ({
      shape: trim(s),
      id: i + 1
    }));

    let result = null;

    for (let order of permute(indexedShapes)) {
      result = dfs(board, order, 0, []);
      if (result) break;
    }

    setSolution(result || "❌ No solution");
  };

  // ========= UI =========

  const renderGrid = (grid, toggle, size = 30) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${grid[0].length}, ${size}px)` }}>
      {grid.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={r + "-" + c}
            onClick={() => toggle(r, c)}
            style={{
              width: size,
              height: size,
              border: "1px solid #999",
              background: cell ? "#1976d2" : "#fff",
              cursor: "pointer"
            }}
          />
        ))
      )}
    </div>
  );

  return (
    <div style={{ padding: 20 }}>
      <h2>🧩 Block Puzzle Solver (Correct)</h2>

      <h3>Board</h3>
      {renderGrid(board, (r, c) => toggleBoard(r, c), 35)}

      <h3>Shape 1</h3>
      {renderGrid(shapes[0], (r, c) => toggleShape(0, r, c))}

      <h3>Shape 2</h3>
      {renderGrid(shapes[1], (r, c) => toggleShape(1, r, c))}

      <h3>Shape 3</h3>
      {renderGrid(shapes[2], (r, c) => toggleShape(2, r, c))}

      <br />
      <button onClick={solve}>Solve</button>

      <h3>Solution:</h3>
      <pre>{JSON.stringify(solution, null, 2)}</pre>
    </div>
  );
}