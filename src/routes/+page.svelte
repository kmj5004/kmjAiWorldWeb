<script lang="ts">
	let originalImageUrl: string | null = null;
	let downscaledImageUrl: string | null = null;
	let prediction: string | null = null;
	let isLoading = false;
	let error: string | null = null;

	const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

	async function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) {
			return;
		}

		const file = input.files[0];
		if (!file.type.startsWith('image/')) {
			error = '이미지 파일만 업로드할 수 있습니다.';
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
			if (err instanceof Error) {
				error = `오류가 발생했습니다: ${err.message}`;
			} else {
				error = '알 수 없는 오류가 발생했습니다.';
			}
		} finally {
			isLoading = false;
		}
	}

	function processImage(file: File): Promise<{ pixels: number[]; dataUrl: string }> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (event) => {
				const img = new Image();
				img.onload = () => {
					const canvas = document.createElement('canvas');
					canvas.width = 28;
					canvas.height = 28;
					const ctx = canvas.getContext('2d');
					if (!ctx) {
						return reject(new Error('Canvas 컨텍스트를 가져올 수 없습니다.'));
					}

					// 흰색 배경으로 채우기
					ctx.fillStyle = 'white';
					ctx.fillRect(0, 0, 28, 28);
					
					ctx.drawImage(img, 0, 0, 28, 28);
					const imageData = ctx.getImageData(0, 0, 28, 28).data;

					const normalizedPixels: number[] = [];
					for (let i = 0; i < imageData.length; i += 4) {
						const grayscale = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
						normalizedPixels.push(1.0 - grayscale / 255.0);
					}

					// 디버깅: 픽셀 값 분포 확인
					const uniqueValues = new Set(normalizedPixels);
					const avgValue = normalizedPixels.reduce((a, b) => a + b, 0) / normalizedPixels.length;
					console.log('총 픽셀 수:', normalizedPixels.length);
					console.log('고유한 값의 개수:', uniqueValues.size);
					console.log('평균 픽셀 값:', avgValue);
					console.log('최소값:', Math.min(...normalizedPixels));
					console.log('최대값:', Math.max(...normalizedPixels));
					console.log('첫 10개 픽셀 값:', normalizedPixels.slice(0, 10));

					resolve({
						pixels: normalizedPixels,
						dataUrl: canvas.toDataURL()
					});
				};
				img.onerror = () => reject(new Error('이미지를 로드할 수 없습니다.'));
				img.src = event.target?.result as string;
			};
			reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
			reader.readAsDataURL(file);
		});
	}

	async function getPrediction(pixels: number[]) {
		try {
			const response = await fetch(`${apiBase}/network/predict`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ image: pixels })
			});

			if (!response.ok) {
				throw new Error(`API 요청 실패: ${response.statusText}`);
			}

			const result = await response.json();
			if (result.error) {
				error = result.error;
				prediction = null;
				return;
			}
			prediction = String(result.result);
		} catch (err) {
			if (err instanceof Error) {
				error = `예측 실패: ${err.message}. 백엔드 서버가 실행 중인지 확인하세요.`;
			} else {
				error = '알 수 없는 오류로 예측에 실패했습니다.';
			}
			prediction = null;
		}
	}
</script>

<main>
	<h1>민재의 레전드 ai 세상</h1>

	<div class="upload-area">
		<label for="file-upload" class="custom-file-upload"> 이미지 선택 </label>
		<input id="file-upload" type="file" accept="image/*" on:change={handleFileSelect} />
	</div>

	{#if isLoading}
		<p>예측 중...</p>
	{/if}

	{#if error}
		<p class="error">{error}</p>
	{/if}

	{#if originalImageUrl}
		<div class="result-area">
			<div class="image-container">
				<img src={originalImageUrl} alt="업로드된 원본 이미지" />
			</div>

			<div class="prediction-container">
				{#if prediction}
					<p class="prediction-text">{prediction}</p>
				{:else if !isLoading && !error}
					<p>결과를 기다리는 중...</p>
				{/if}
			</div>
		</div>
	{/if}
</main>

<style>
	main {
		max-width: 960px;
		margin: 0 auto;
		padding: 2rem;
		text-align: center;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			'Open Sans', 'Helvetica Neue', sans-serif;
	}

	.upload-area {
		margin: 2rem 0;
	}

	.custom-file-upload {
		display: inline-block;
		padding: 10px 20px;
		cursor: pointer;
		background-color: #007bff;
		color: white;
		border-radius: 5px;
		font-weight: bold;
	}

	.custom-file-upload:hover {
		background-color: #0056b3;
	}

	input[type='file'] {
		display: none;
	}

	.result-area {
		display: flex;
		justify-content: space-around;
		align-items: flex-start;
		margin-top: 2rem;
		gap: 2rem;
		text-align: center;
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
		border: 1px solid #ddd;
		border-radius: 5px;
		margin-top: 1rem;
	}

	.prediction-text {
		font-size: 5rem;
		font-weight: bold;
		color: #28a745;
		margin-top: 1rem;
	}

	.error {
		color: #dc3545;
		font-weight: bold;
	}
</style>