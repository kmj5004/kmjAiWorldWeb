<script lang="ts">
	import { onMount } from "svelte";

	let activeTab: "recognize" | "train" = "recognize";

	// Recognition tab state
	let originalImageUrl: string | null = null;
	let downscaledImageUrl: string | null = null;
	let prediction: string | null = null;
	let isLoading = false;
	let error: string | null = null;
	let canvas: HTMLCanvasElement;
	let isDrawing = false;
	let lastX = 0;
	let lastY = 0;

	// Training tab state
	let isTraining = false;
	let trainingMessage = "";
	let testResult: any = null;

	const apiBase = import.meta.env.VITE_API_BASE || "http://localhost:8000";

	// Recognition functions
	async function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const file = input.files[0];
		if (!file.type.startsWith("image/")) {
			error = "이미지 파일만 업로드할 수 있습니다.";
			return;
		}

		prediction = null;
		error = null;
		isLoading = true;
		downscaledImageUrl = null;
		originalImageUrl = URL.createObjectURL(file);

		try {
			const { pixels, dataUrl } = await processImage(file);
			downscaledImageUrl = dataUrl;
			await getPrediction(pixels);
		} catch (err) {
			error =
				err instanceof Error
					? `오류: ${err.message}`
					: "알 수 없는 오류";
		} finally {
			isLoading = false;
		}
	}

	function processImage(
		file: File,
	): Promise<{ pixels: number[]; dataUrl: string }> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (event) => {
				const img = new Image();
				img.onload = () => {
					const canvas = document.createElement("canvas");
					canvas.width = 28;
					canvas.height = 28;
					const ctx = canvas.getContext("2d");
					if (!ctx) return reject(new Error("Canvas 컨텍스트 오류"));

					ctx.fillStyle = "white";
					ctx.fillRect(0, 0, 28, 28);
					ctx.drawImage(img, 0, 0, 28, 28);
					const imageData = ctx.getImageData(0, 0, 28, 28).data;

					const normalizedPixels: number[] = [];
					for (let i = 0; i < imageData.length; i += 4) {
						const grayscale =
							(imageData[i] +
								imageData[i + 1] +
								imageData[i + 2]) /
							3;
						normalizedPixels.push(1.0 - grayscale / 255.0);
					}

					resolve({
						pixels: normalizedPixels,
						dataUrl: canvas.toDataURL(),
					});
				};
				img.onerror = () => reject(new Error("이미지 로드 실패"));
				img.src = event.target?.result as string;
			};
			reader.onerror = () => reject(new Error("파일 읽기 실패"));
			reader.readAsDataURL(file);
		});
	}

	async function getPrediction(pixels: number[]) {
		try {
			const response = await fetch(`${apiBase}/mnist/predict`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ image: pixels }),
			});

			if (!response.ok)
				throw new Error(`API 요청 실패: ${response.statusText}`);

			const result = await response.json();
			if (result.error) {
				error = result.error;
				prediction = null;
			} else {
				prediction = String(result.result);
			}
		} catch (err) {
			error =
				err instanceof Error
					? `예측 실패: ${err.message}`
					: "예측 실패";
			prediction = null;
		}
	}

	function initCanvas(node: HTMLCanvasElement) {
		const ctx = node.getContext("2d");
		if (!ctx) return;
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, node.width, node.height);
	}

	function startDrawing(e: MouseEvent) {
		isDrawing = true;
		const rect = canvas.getBoundingClientRect();
		lastX = e.clientX - rect.left;
		lastY = e.clientY - rect.top;
		draw(e);
	}

	function stopDrawing() {
		isDrawing = false;
	}

	function draw(e: MouseEvent) {
		if (!isDrawing) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const rect = canvas.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		ctx.fillStyle = "black";
		const distance = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
		const steps = Math.max(1, Math.floor(distance / 2));

		for (let i = 0; i <= steps; i++) {
			const interpX = lastX + (x - lastX) * (i / steps);
			const interpY = lastY + (y - lastY) * (i / steps);
			ctx.beginPath();
			ctx.arc(interpX, interpY, 6, 0, Math.PI * 2);
			ctx.fill();
		}

		lastX = x;
		lastY = y;
	}

	function clearCanvas() {
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		prediction = null;
		error = null;
		originalImageUrl = null;
		downscaledImageUrl = null;
	}

	async function recognizeDrawing() {
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		prediction = null;
		error = null;
		isLoading = true;

		try {
			const tempCanvas = document.createElement("canvas");
			tempCanvas.width = 28;
			tempCanvas.height = 28;
			const tempCtx = tempCanvas.getContext("2d");
			if (!tempCtx) throw new Error("Canvas 컨텍스트 오류");

			tempCtx.fillStyle = "white";
			tempCtx.fillRect(0, 0, 28, 28);
			tempCtx.drawImage(canvas, 0, 0, 28, 28);

			const imageData = tempCtx.getImageData(0, 0, 28, 28).data;
			const normalizedPixels: number[] = [];

			for (let i = 0; i < imageData.length; i += 4) {
				const grayscale =
					(imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
				normalizedPixels.push(1.0 - grayscale / 255.0);
			}

			downscaledImageUrl = tempCanvas.toDataURL();
			originalImageUrl = canvas.toDataURL();

			await getPrediction(normalizedPixels);
		} catch (err) {
			error =
				err instanceof Error
					? `오류: ${err.message}`
					: "알 수 없는 오류";
		} finally {
			isLoading = false;
		}
	}

	// Training functions
	async function startTraining() {
		isTraining = true;
		trainingMessage = "학습을 시작합니다...";
		error = null;

		try {
			const response = await fetch(`${apiBase}/mnist/train`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					eta: null,
					l2_lambda: null,
					save_model: true,
				}),
			});

			const data = await response.json();
			if (response.ok) {
				trainingMessage =
					data.message ||
					"학습이 시작되었습니다. 백엔드에서 진행 중입니다.";
			} else {
				error = data.error || "학습 시작 실패";
				isTraining = false;
			}
		} catch (err) {
			error = "학습 시작 요청 실패. 백엔드 서버를 확인하세요.";
			isTraining = false;
		}
	}

	async function testModel() {
		error = null;
		try {
			const response = await fetch(`${apiBase}/mnist/test`);
			const data = await response.json();

			if (response.ok) {
				testResult = data;
				trainingMessage = `테스트 완료: ${data.percentage.toFixed(2)}%`;
			} else {
				error = data.error || "테스트 실패";
			}
		} catch (err) {
			error = "모델 테스트 실패. 백엔드 서버를 확인하세요.";
		}
	}
</script>

<main>
	<h1>🎨 숫자 인식 & 학습</h1>
	<p class="subtitle">AI로 손글씨 숫자를 인식하고 모델을 학습시켜보세요</p>

	<div class="tabs">
		<button
			class="tab"
			class:active={activeTab === "recognize"}
			on:click={() => (activeTab = "recognize")}
		>
			🔍 숫자 인식
		</button>
		<button
			class="tab"
			class:active={activeTab === "train"}
			on:click={() => (activeTab = "train")}
		>
			🧠 모델 학습
		</button>
	</div>

	{#if activeTab === "recognize"}
		<div class="tab-content">
			<div class="upload-area">
				<label for="file-upload" class="custom-file-upload"
					>이미지 선택</label
				>
				<input
					id="file-upload"
					type="file"
					accept="image/*"
					on:change={handleFileSelect}
				/>
			</div>

			<div class="canvas-area">
				<h2>또는 직접 그려보세요</h2>
				<canvas
					bind:this={canvas}
					width="280"
					height="280"
					on:mousedown={startDrawing}
					on:mouseup={stopDrawing}
					on:mouseleave={stopDrawing}
					on:mousemove={draw}
					use:initCanvas
				></canvas>
				<div class="canvas-buttons">
					<button on:click={clearCanvas} class="btn-clear"
						>지우기</button
					>
					<button on:click={recognizeDrawing} class="btn-recognize"
						>인식하기</button
					>
				</div>
			</div>

			{#if isLoading}
				<p class="loading">예측 중...</p>
			{/if}

			{#if error}
				<p class="error">{error}</p>
			{/if}

			{#if originalImageUrl}
				<div class="result-area">
					<div class="image-container">
						<img src={originalImageUrl} alt="입력 이미지" />
					</div>
					<div class="prediction-container">
						{#if prediction}
							<p class="prediction-text">{prediction}</p>
						{:else if !isLoading && !error}
							<p class="waiting">결과 대기 중...</p>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{:else}
		<div class="tab-content">
			<div class="training-section">
				<h2>모델 학습</h2>
				<p class="info">
					최적 설정으로 모델을 학습시킵니다. 학습에는 시간이 소요될 수
					있습니다.
				</p>

				<div class="button-group">
					<button
						on:click={startTraining}
						disabled={isTraining}
						class="btn-train"
					>
						{isTraining ? "학습 중..." : "학습 시작"}
					</button>
					<button on:click={testModel} class="btn-test">
						모델 테스트
					</button>
				</div>

				{#if trainingMessage}
					<p class="success">{trainingMessage}</p>
				{/if}

				{#if error}
					<p class="error">{error}</p>
				{/if}

				{#if testResult}
					<div class="test-result">
						<h3>테스트 결과</h3>
						<div class="result-large">
							{testResult.percentage.toFixed(2)}%
						</div>
						<div class="result-details">
							정답: {testResult.accuracy} / {testResult.total}
						</div>
					</div>
				{/if}

				<div class="training-info">
					<h3>💡 참고사항</h3>
					<ul>
						<li>학습은 백엔드 서버에서 진행됩니다</li>
						<li>
							학습 진행 상황은 백엔드 로그에서 확인할 수 있습니다
						</li>
						<li>학습 완료 후 모델 테스트로 성능을 확인하세요</li>
					</ul>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	:global(body) {
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
		min-height: 100vh;
		margin: 0;
		padding: 0;
	}

	main {
		max-width: 960px;
		margin: 0 auto;
		padding: 3rem 2rem;
		text-align: center;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			"Helvetica Neue", sans-serif;
		min-height: calc(100vh - 72px);
	}

	h1 {
		color: white;
		margin-bottom: 0.5rem;
		font-size: 2.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		color: #e2e8f0;
		font-size: 1.1rem;
		margin-bottom: 2rem;
	}

	.tabs {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.tab {
		padding: 12px 32px;
		font-size: 1.1rem;
		font-weight: 600;
		border: 2px solid rgba(102, 126, 234, 0.5);
		border-radius: 12px;
		background: rgba(30, 41, 59, 0.7);
		backdrop-filter: blur(10px);
		color: #e2e8f0;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.tab:hover {
		border-color: #667eea;
		background: rgba(102, 126, 234, 0.2);
	}

	.tab.active {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-color: #667eea;
		color: white;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
	}

	.tab-content {
		animation: fadeIn 0.3s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.upload-area {
		margin: 2rem 0;
	}

	.custom-file-upload {
		display: inline-block;
		padding: 12px 28px;
		cursor: pointer;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 10px;
		font-weight: bold;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}

	.custom-file-upload:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}

	input[type="file"] {
		display: none;
	}

	.canvas-area {
		margin: 2rem 0;
	}

	.canvas-area h2 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: #e2e8f0;
	}

	canvas {
		border: 3px solid rgba(102, 126, 234, 0.5);
		cursor: crosshair;
		background-color: white;
		display: block;
		margin: 0 auto;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
		border-radius: 8px;
	}

	.canvas-buttons {
		margin-top: 1rem;
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.canvas-buttons button {
		padding: 12px 32px;
		font-size: 1rem;
		font-weight: bold;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-clear {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
	}

	.btn-clear:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
	}

	.btn-recognize {
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
	}

	.btn-recognize:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
	}

	.result-area {
		display: flex;
		justify-content: space-around;
		align-items: flex-start;
		margin-top: 2rem;
		gap: 2rem;
	}

	.image-container,
	.prediction-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	img {
		max-width: 100%;
		height: auto;
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		margin-top: 1rem;
	}

	.prediction-text {
		font-size: 5rem;
		font-weight: bold;
		color: #4ade80;
		margin-top: 1rem;
		text-shadow: 0 0 20px rgba(74, 222, 128, 0.5);
	}

	.loading,
	.waiting {
		color: #e2e8f0;
		font-size: 1.1rem;
		margin: 1rem 0;
	}

	.error {
		color: #f87171;
		font-weight: bold;
		margin: 1rem 0;
		font-size: 1.1rem;
	}

	.success {
		color: #4ade80;
		font-weight: bold;
		margin: 1rem 0;
		font-size: 1.1rem;
	}

	/* Training tab styles */
	.training-section {
		max-width: 600px;
		margin: 0 auto;
	}

	.training-section h2 {
		color: white;
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.info {
		color: #cbd5e1;
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	.button-group {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin: 2rem 0;
	}

	.btn-train,
	.btn-test {
		padding: 14px 32px;
		font-size: 1.1rem;
		font-weight: bold;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
		color: white;
	}

	.btn-train {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}

	.btn-train:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
	}

	.btn-train:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-test {
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
		box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
	}

	.btn-test:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
	}

	.test-result {
		background: rgba(30, 41, 59, 0.7);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 2rem;
		margin: 2rem 0;
	}

	.test-result h3 {
		color: white;
		margin-bottom: 1rem;
	}

	.result-large {
		font-size: 3.5rem;
		font-weight: bold;
		color: #4ade80;
		margin: 1rem 0;
	}

	.result-details {
		color: #e2e8f0;
		font-size: 1.2rem;
	}

	.training-info {
		background: rgba(30, 41, 59, 0.5);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 1.5rem;
		margin-top: 2rem;
		text-align: left;
	}

	.training-info h3 {
		color: white;
		margin-bottom: 1rem;
	}

	.training-info ul {
		color: #cbd5e1;
		line-height: 1.8;
		margin: 0;
		padding-left: 1.5rem;
	}

	@media (max-width: 768px) {
		main {
			padding: 2rem 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		.tabs {
			flex-direction: column;
			gap: 0.5rem;
		}

		.tab {
			width: 100%;
		}

		.result-area {
			flex-direction: column;
		}

		.button-group {
			flex-direction: column;
		}

		.btn-train,
		.btn-test {
			width: 100%;
		}
	}
</style>
