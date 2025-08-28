import React, { useEffect, useMemo, useState } from "react";

const HUMAN = "X"; // pemain
const BOT = "O"; // komputer
const LINE_COLOR = "#FFF3C9";

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], 
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], 
  [0, 4, 8],
  [2, 4, 6],
];

function calcWinner(sq) {
  for (const [a, b, c] of LINES) {
    if (sq[a] && sq[a] === sq[b] && sq[a] === sq[c]) {
      return { winner: sq[a], line: [a, b, c] };
    }
  }
  return null;
}

const isBoardFull = (sq) => sq.every(Boolean);

function evaluate(sq) {
  const w = calcWinner(sq);
  if (w?.winner === BOT) return +10;
  if (w?.winner === HUMAN) return -10;
  return 0;
}

function availableMoves(sq) {
  const arr = [];
  for (let i = 0; i < 9; i++) if (!sq[i]) arr.push(i);
  return arr;
}

function minimax(sq, isMax, depth = 0) {
  const scoreNow = evaluate(sq);
  if (scoreNow === 10) return scoreNow - depth;
  if (scoreNow === -10) return scoreNow + depth;
  if (isBoardFull(sq)) return 0;

  if (isMax) {
    let best = -Infinity;
    for (const mv of availableMoves(sq)) {
      sq[mv] = BOT;
      best = Math.max(best, minimax(sq, false, depth + 1));
      sq[mv] = null;
    }
    return best;
  } else {
    let best = +Infinity;
    for (const mv of availableMoves(sq)) {
      sq[mv] = HUMAN;
      best = Math.min(best, minimax(sq, true, depth + 1));
      sq[mv] = null;
    }
    return best;
  }
}

function bestMoveByMinimax(sq) {
  let bestVal = -Infinity;
  let candidates = [];
  for (const mv of availableMoves(sq)) {
    sq[mv] = BOT;
    const val = minimax(sq, false, 0);
    sq[mv] = null;
    if (val > bestVal) {
      bestVal = val;
      candidates = [mv];
    } else if (val === bestVal) {
      candidates.push(mv);
    }
  }
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pickBotMove50(sq) {
  const moves = availableMoves(sq);
  if (moves.length === 0) return null;
  if (Math.random() < 0.5)
    return moves[Math.floor(Math.random() * moves.length)];
  return bestMoveByMinimax(sq);
}

/** Logo X/O **/
function Token({ value }) {
  if (value === "O") {
    return (
      <svg
        viewBox="0 0 100 100"
        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
      >
        <circle cx="50" cy="50" r="33" fill="#0D1B2A" />
        <circle cx="50" cy="50" r="18" fill={LINE_COLOR} />
      </svg>
    );
  }
  if (value === "X") {
    return (
      <svg
        viewBox="0 0 100 100"
        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16"
      >
        <path
          d="M25 25 L75 75"
          stroke="#0D1B2A"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M75 25 L25 75"
          stroke="#0D1B2A"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M25 25 L75 75"
          stroke={LINE_COLOR}
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M75 25 L25 75"
          stroke={LINE_COLOR}
          strokeWidth="12"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return null;
}

/** Papan **/
function Square({ value, onClick, disabled, highlight }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-20 sm:w-24 md:w-28",
        "aspect-square flex items-center justify-center",
        highlight ? "bg-amber-200/40" : "bg-transparent",
        "hover:brightness-105 disabled:opacity-70 disabled:cursor-not-allowed",
      ].join(" ")}
    >
      <Token value={value} />
    </button>
  );
}

/** App **/
export default function App() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [step, setStep] = useState(0);

  const squares = history[step];
  const winnerObj = useMemo(() => calcWinner(squares), [squares]);
  const isDraw = !winnerObj && isBoardFull(squares);
  const isCurrent = step === history.length - 1;
  const humanTurn = isCurrent && !winnerObj && !isDraw && step % 2 === 0;
  const botTurn = isCurrent && !winnerObj && !isDraw && step % 2 === 1;

  let statusText = "";
  let statusStyle =
    "px-4 py-2 rounded-xl font-semibold text-white shadow bg-slate-800";
  if (winnerObj?.winner === HUMAN) {
    statusText = "Kamu menang 🎉";
    statusStyle =
      "px-4 py-2 rounded-xl font-semibold text-white shadow bg-green-600";
  } else if (winnerObj?.winner === BOT) {
    statusText = "Kamu kalah";
    statusStyle =
      "px-4 py-2 rounded-xl font-semibold text-white shadow bg-red-600";
  } else if (isDraw) {
    statusText = "Seri";
    statusStyle =
      "px-4 py-2 rounded-xl font-semibold text-white shadow bg-yellow-400";
  } else {
    statusText = humanTurn
      ? "Giliran kamu"
      : botTurn
      ? "Giliran robot"
      : "Riwayat";
  }

  function handleHumanMove(i) {
    if (!isCurrent || !humanTurn || squares[i] || winnerObj) return;
    const next = squares.slice();
    next[i] = HUMAN;
    const base = history.slice(0, step + 1);
    setHistory([...base, next]);
    setStep(step + 1);
  }

  useEffect(() => {
    if (!isCurrent || !botTurn || winnerObj) return;
    const timer = setTimeout(() => {
      const next = history[step].slice();
      const mv = pickBotMove50(next);
      if (mv != null) {
        next[mv] = BOT;
        const base = history.slice(0, step + 1);
        setHistory([...base, next]);
        setStep(step + 1);
      }
    }, 420);
    return () => clearTimeout(timer);
  }, [botTurn, winnerObj, history, step, isCurrent]);

  function resetGame() {
    setHistory([Array(9).fill(null)]);
    setStep(0);
  }

  const winLine = winnerObj?.line ?? [];

  return (
    <div className="min-h-screen flex items-start justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6 md:gap-8">
        {/* papan */}
        <div className="flex flex-col items-center gap-4 sm:gap-5">
          <div className={statusStyle}>{statusText}</div>
          <div className="bg-board p-3 sm:p-4 rounded-3xl shadow-board inline-block">
            <div className="relative">
              <div className="grid grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Square
                    key={i}
                    value={squares[i]}
                    onClick={() => handleHumanMove(i)}
                    disabled={
                      !!winnerObj || isDraw || !humanTurn || !!squares[i]
                    }
                    highlight={winLine.includes(i)}
                  />
                ))}
              </div>
              {/* garis grid */}
              <svg
                className="pointer-events-none absolute inset-0"
                viewBox="0 0 300 300"
                preserveAspectRatio="none"
              >
                <line
                  x1="100"
                  y1="0"
                  x2="100"
                  y2="300"
                  stroke={LINE_COLOR}
                  strokeWidth="10"
                />
                <line
                  x1="200"
                  y1="0"
                  x2="200"
                  y2="300"
                  stroke={LINE_COLOR}
                  strokeWidth="10"
                />
                <line
                  x1="0"
                  y1="100"
                  x2="300"
                  y2="100"
                  stroke={LINE_COLOR}
                  strokeWidth="10"
                />
                <line
                  x1="0"
                  y1="200"
                  x2="300"
                  y2="200"
                  stroke={LINE_COLOR}
                  strokeWidth="10"
                />
              </svg>
            </div>
          </div>

          <button
            onClick={resetGame}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:opacity-90"
          >
            Reset
          </button>
        </div>

        {/* riwayat */}
        <aside className="md:pt-10">
          <div className="bg-white/80 rounded-2xl p-4 ring-1 ring-slate-200">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="text-sm text-slate-600 font-medium">
                Kamu: <Token value="X" />
              </div>
              <div className="text-sm text-slate-600 font-medium">
                Robot: <Token value="O" />
              </div>
            </div>

            <h2 className="font-bold text-slate-800 mb-3">Riwayat:</h2>
            <div className="space-y-2 max-h-[40vh] overflow-auto pr-1">
              {history.map((_, s) => {
                if (s === 0) return null;
                const label = `Move ${s}`;
                const active = s === step;
                return (
                  <button
                    key={s}
                    onClick={() => setStep(s)}
                    className={[
                      "w-full text-left px-3 py-2 rounded-lg border",
                      active
                        ? "bg-amber-200/70 border-amber-300"
                        : "bg-white hover:bg-amber-50 border-slate-200",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
