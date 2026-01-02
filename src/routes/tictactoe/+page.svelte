<script lang="ts">
    type GameType = "tictactoe" | "omok";

    let gameType: GameType = "tictactoe";
    let board: string[] = [];
    let currentPlayer: string = "X";
    let winner: string | null = null;
    let gameOver: boolean = false;
    let boardSize = 3;

    $: {
        if (gameType === "tictactoe") {
            boardSize = 3;
        } else {
            boardSize = 15;
        }
        // Reinitialize board when game type changes
        board = Array(boardSize * boardSize).fill("");
        currentPlayer = "X";
        winner = null;
        gameOver = false;
    }

    function initBoard() {
        board = Array(boardSize * boardSize).fill("");
        currentPlayer = "X";
        winner = null;
        gameOver = false;
    }

    function checkWinner(b: string[]): string | null {
        if (gameType === "tictactoe") {
            return checkTicTacToeWinner(b);
        } else {
            return checkOmokWinner(b);
        }
    }

    function checkTicTacToeWinner(b: string[]): string | null {
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

        for (const [a, b_idx, c] of lines) {
            if (b[a] && b[a] === b[b_idx] && b[a] === b[c]) {
                return b[a];
            }
        }
        return null;
    }

    function checkOmokWinner(b: string[]): string | null {
        const size = boardSize;

        // Check horizontal, vertical, and diagonal
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = b[row * size + col];
                if (!cell) continue;

                // Horizontal
                if (col <= size - 5) {
                    let count = 0;
                    for (let i = 0; i < 5; i++) {
                        if (b[row * size + col + i] === cell) count++;
                    }
                    if (count === 5) return cell;
                }

                // Vertical
                if (row <= size - 5) {
                    let count = 0;
                    for (let i = 0; i < 5; i++) {
                        if (b[(row + i) * size + col] === cell) count++;
                    }
                    if (count === 5) return cell;
                }

                // Diagonal (top-left to bottom-right)
                if (row <= size - 5 && col <= size - 5) {
                    let count = 0;
                    for (let i = 0; i < 5; i++) {
                        if (b[(row + i) * size + col + i] === cell) count++;
                    }
                    if (count === 5) return cell;
                }

                // Diagonal (top-right to bottom-left)
                if (row <= size - 5 && col >= 4) {
                    let count = 0;
                    for (let i = 0; i < 5; i++) {
                        if (b[(row + i) * size + col - i] === cell) count++;
                    }
                    if (count === 5) return cell;
                }
            }
        }
        return null;
    }

    function isBoardFull(b: string[]): boolean {
        return !b.includes("");
    }

    function makeMove(position: number) {
        if (board[position] !== "" || gameOver) return;

        board[position] = currentPlayer;
        board = [...board];

        winner = checkWinner(board);
        if (winner) {
            gameOver = true;
            return;
        }

        if (isBoardFull(board)) {
            gameOver = true;
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";

        if (currentPlayer === "O" && !gameOver) {
            setTimeout(() => makeAIMove(), 300);
        }
    }

    function makeAIMove() {
        if (gameType === "tictactoe") {
            makeTicTacToeAIMove();
        } else {
            makeOmokAIMove();
        }
    }

    function makeTicTacToeAIMove() {
        const opponent = "X";
        const ai = "O";

        // Try to win
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                const testBoard = [...board];
                testBoard[i] = ai;
                if (checkWinner(testBoard) === ai) {
                    makeMove(i);
                    return;
                }
            }
        }

        // Block opponent
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                const testBoard = [...board];
                testBoard[i] = opponent;
                if (checkWinner(testBoard) === opponent) {
                    makeMove(i);
                    return;
                }
            }
        }

        // Take center
        if (board[4] === "") {
            makeMove(4);
            return;
        }

        // Take corner
        const corners = [0, 2, 6, 8];
        for (const corner of corners) {
            if (board[corner] === "") {
                makeMove(corner);
                return;
            }
        }

        // Take any
        for (let i = 0; i < 9; i++) {
            if (board[i] === "") {
                makeMove(i);
                return;
            }
        }
    }

    function makeOmokAIMove() {
        // Simple AI: find best position based on threats and opportunities
        let bestScore = -Infinity;
        let bestMove = -1;

        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                let score = evaluatePosition(i);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }

        if (bestMove !== -1) {
            makeMove(bestMove);
        }
    }

    function evaluatePosition(pos: number): number {
        const size = boardSize;
        const row = Math.floor(pos / size);
        const col = pos % size;
        let score = 0;

        // Prefer center positions
        const centerDist = Math.abs(row - size / 2) + Math.abs(col - size / 2);
        score += (size - centerDist) * 0.1;

        // Check if position creates threats or blocks opponent
        board[pos] = "O";
        score += countThreats("O", pos) * 10;
        board[pos] = "X";
        score += countThreats("X", pos) * 15; // Blocking is more important
        board[pos] = "";

        return score;
    }

    function countThreats(player: string, pos: number): number {
        const size = boardSize;
        const row = Math.floor(pos / size);
        const col = pos % size;
        let threats = 0;

        const directions = [
            [0, 1], // horizontal
            [1, 0], // vertical
            [1, 1], // diagonal \
            [1, -1], // diagonal /
        ];

        for (const [dr, dc] of directions) {
            let count = 1; // Count the current position

            // Check forward
            for (let i = 1; i < 5; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r < 0 || r >= size || c < 0 || c >= size) break;
                if (board[r * size + c] === player) count++;
                else break;
            }

            // Check backward
            for (let i = 1; i < 5; i++) {
                const r = row - dr * i;
                const c = col - dc * i;
                if (r < 0 || r >= size || c < 0 || c >= size) break;
                if (board[r * size + c] === player) count++;
                else break;
            }

            if (count >= 3) threats += count;
        }

        return threats;
    }

    function newGame() {
        initBoard();
    }

    function switchGame(type: GameType) {
        gameType = type;
        initBoard();
    }

    // Initialize on mount
    initBoard();
</script>

<main>
    <h1>🎮 보드 게임 AI</h1>
    <p class="subtitle">AI와 대결해보세요!</p>

    <div class="game-selector">
        <button
            class="game-btn"
            class:active={gameType === "tictactoe"}
            on:click={() => switchGame("tictactoe")}
        >
            틱택토 (3x3)
        </button>
        <button
            class="game-btn"
            class:active={gameType === "omok"}
            on:click={() => switchGame("omok")}
        >
            오목 (15x15)
        </button>
    </div>

    <div class="game-info">
        {#if winner}
            <p class="winner">
                🎉 {winner === "X" ? "당신이" : "AI가"} 승리!
            </p>
        {:else if gameOver}
            <p class="draw">무승부!</p>
        {:else}
            <p class="current-turn">
                현재 차례:
                {#if gameType === "omok"}
                    <span
                        class="stone-indicator {currentPlayer === 'X'
                            ? 'black'
                            : 'white'}"
                    ></span>
                {:else}
                    <span class="player-{currentPlayer}">{currentPlayer}</span>
                {/if}
            </p>
        {/if}
    </div>

    <div class="board-container">
        {#if gameType === "omok"}
            <div class="omok-board-wrapper">
                <svg
                    class="omok-grid"
                    viewBox="0 0 560 560"
                    width="560"
                    height="560"
                >
                    <!-- Grid lines -->
                    {#each Array(boardSize) as _, i}
                        <!-- Horizontal lines -->
                        <line
                            x1="20"
                            y1={20 + i * 40}
                            x2="580"
                            y2={20 + i * 40}
                            stroke="#8b6f47"
                            stroke-width="1.5"
                        />
                        <!-- Vertical lines -->
                        <line
                            x1={20 + i * 40}
                            y1="20"
                            x2={20 + i * 40}
                            y2="580"
                            stroke="#8b6f47"
                            stroke-width="1.5"
                        />
                    {/each}

                    <!-- Star points (화점) -->
                    <circle cx="140" cy="140" r="4" fill="#8b6f47" />
                    <circle cx="300" cy="140" r="4" fill="#8b6f47" />
                    <circle cx="460" cy="140" r="4" fill="#8b6f47" />
                    <circle cx="140" cy="300" r="4" fill="#8b6f47" />
                    <circle cx="300" cy="300" r="4" fill="#8b6f47" />
                    <circle cx="460" cy="300" r="4" fill="#8b6f47" />
                    <circle cx="140" cy="460" r="4" fill="#8b6f47" />
                    <circle cx="300" cy="460" r="4" fill="#8b6f47" />
                    <circle cx="460" cy="460" r="4" fill="#8b6f47" />
                </svg>

                <!-- Intersection points for clicking -->
                <div class="omok-intersections">
                    {#each board as cell, i}
                        {@const row = Math.floor(i / boardSize)}
                        {@const col = i % boardSize}
                        <button
                            class="intersection"
                            style="left: {20 + col * 40}px; top: {20 +
                                row * 40}px;"
                            on:click={() => makeMove(i)}
                            disabled={gameOver ||
                                cell !== "" ||
                                currentPlayer === "O"}
                        >
                            {#if cell}
                                <div
                                    class="stone"
                                    class:black={cell === "X"}
                                    class:white={cell === "O"}
                                ></div>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>
        {:else}
            <div class="board" style="--board-size: {boardSize}">
                {#each board as cell, i}
                    <button
                        class="cell"
                        class:occupied={cell !== ""}
                        class:X={cell === "X"}
                        class:O={cell === "O"}
                        on:click={() => makeMove(i)}
                        disabled={gameOver ||
                            cell !== "" ||
                            currentPlayer === "O"}
                    >
                        {cell}
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    <div class="controls">
        <button class="btn-new" on:click={newGame}>새 게임</button>
    </div>
</main>

<style>
    :global(body) {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        min-height: 100vh;
        margin: 0;
        padding: 0;
    }

    main {
        max-width: 900px;
        margin: 0 auto;
        padding: 2rem 1rem;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            "Helvetica Neue", sans-serif;
        min-height: calc(100vh - 72px);
    }

    h1 {
        color: white;
        margin-bottom: 0.5rem;
        font-size: 2.5rem;
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .subtitle {
        color: #e2e8f0;
        font-size: 1.1rem;
        margin-bottom: 2rem;
    }

    .game-selector {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .game-btn {
        padding: 12px 28px;
        font-size: 1.05rem;
        font-weight: 600;
        border: 2px solid rgba(79, 172, 254, 0.5);
        border-radius: 12px;
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(10px);
        color: #e2e8f0;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .game-btn:hover {
        border-color: #4facfe;
        background: rgba(79, 172, 254, 0.2);
        transform: translateY(-2px);
    }

    .game-btn.active {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        border-color: #4facfe;
        color: white;
        box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
    }

    .game-info {
        margin: 2rem 0;
        font-size: 1.5rem;
        min-height: 2rem;
        color: #e2e8f0;
    }

    .current-turn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .stone-indicator {
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
        vertical-align: middle;
    }

    .stone-indicator.black {
        background: radial-gradient(circle at 35% 35%, #4a4a4a, #000000);
        border: 1px solid #1a1a1a;
    }

    .stone-indicator.white {
        background: radial-gradient(circle at 35% 35%, #ffffff, #e5e5e5);
        border: 1px solid #d0d0d0;
    }

    .winner {
        color: #4ade80;
        font-weight: bold;
        animation: bounce 0.5s;
    }

    .draw {
        color: #fbbf24;
        font-weight: bold;
    }

    .player-X {
        color: #f87171;
        font-weight: bold;
    }

    .player-O {
        color: #60a5fa;
        font-weight: bold;
    }

    @keyframes bounce {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }

    .board-container {
        display: flex;
        justify-content: center;
        margin: 2rem 0;
        padding: 1rem;
    }

    /* Omok board styles */
    .omok-board-wrapper {
        position: relative;
        width: 560px;
        height: 560px;
        background: #d4a574;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        border: 3px solid #8b6f47;
    }

    .omok-grid {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
    }

    .omok-intersections {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .intersection {
        position: absolute;
        width: 32px;
        height: 32px;
        transform: translate(-50%, -50%);
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .intersection:not(:disabled):hover {
        background: rgba(139, 111, 71, 0.2);
        border-radius: 50%;
    }

    .intersection:disabled {
        cursor: not-allowed;
    }

    /* Tic-tac-toe board styles */
    .board {
        display: grid;
        grid-template-columns: repeat(var(--board-size), minmax(0, 1fr));
        grid-gap: 8px;
        width: fit-content;
        margin: 0 auto;
    }

    .cell {
        width: 100%;
        aspect-ratio: 1;
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(10px);
        border: 3px solid rgba(79, 172, 254, 0.5);
        border-radius: 16px;
        font-size: 56px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        min-width: 80px;
        min-height: 80px;
    }

    .cell:not(.occupied):not(:disabled):hover {
        background: rgba(79, 172, 254, 0.2);
        border-color: #4facfe;
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(79, 172, 254, 0.4);
    }

    .cell.occupied {
        cursor: not-allowed;
    }

    .cell:disabled {
        cursor: not-allowed;
        opacity: 0.6;
    }

    .cell.X {
        color: #f87171;
    }

    .cell.O {
        color: #60a5fa;
    }

    /* Stone styles - perfectly circular */
    .stone {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
        pointer-events: none;
    }

    .stone.black {
        background: radial-gradient(circle at 35% 35%, #4a4a4a, #000000);
        border: 1px solid #1a1a1a;
    }

    .stone.white {
        background: radial-gradient(circle at 35% 35%, #ffffff, #e5e5e5);
        border: 1px solid #d0d0d0;
    }

    .controls {
        margin: 2rem 0;
    }

    .btn-new {
        padding: 14px 32px;
        font-size: 1.1rem;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
    }

    .btn-new:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(74, 222, 128, 0.4);
    }

    @media (max-width: 768px) {
        main {
            padding: 1.5rem 0.5rem;
        }

        h1 {
            font-size: 2rem;
        }

        .game-selector {
            flex-direction: column;
            gap: 0.5rem;
            padding: 0 1rem;
        }

        .game-btn {
            width: 100%;
        }

        /* Tic-tac-toe mobile styles */
        .cell {
            min-width: 60px;
            min-height: 60px;
            font-size: 40px;
        }

        /* Omok mobile styles */
        .omok-board-wrapper {
            width: 100%;
            max-width: 400px;
            height: auto;
            aspect-ratio: 1;
        }

        .omok-grid {
            width: 100%;
            height: 100%;
        }

        .intersection {
            width: 24px;
            height: 24px;
        }

        .stone {
            width: 20px;
            height: 20px;
        }
    }
</style>
