<script lang="ts">
	const features = [
		{
			id: "mnist",
			title: "🎨 숫자 인식 & 학습",
			description:
				"손글씨 숫자를 인식하고 AI 모델을 직접 학습시켜보세요. 실시간으로 학습 과정을 확인할 수 있습니다.",
			gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
			link: "/mnist",
			icon: "🔢",
		},
		{
			id: "games",
			title: "🎮 보드 게임 AI",
			description:
				"AI와 틱택토(3x3)와 오목(15x15) 게임을 즐겨보세요. 과연 AI를 이길 수 있을까요?",
			gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
			link: "/tictactoe",
			icon: "⭕",
		},
	];
</script>

<main>
	<div class="hero">
		<h1 class="hero-title">
			<span class="gradient-text">민재의 레전드</span>
			<span class="ai-text">AI 세상</span>
		</h1>
		<p class="hero-subtitle">다양한 AI 기능을 체험해보세요</p>
	</div>

	<div class="features-grid">
		{#each features as feature}
			<a
				href={feature.link}
				class="feature-card"
				style="--gradient: {feature.gradient}"
			>
				<div class="card-glow"></div>
				<div class="card-content">
					<div class="icon-wrapper">
						<span class="feature-icon">{feature.icon}</span>
					</div>
					<h2 class="feature-title">{feature.title}</h2>
					<p class="feature-description">{feature.description}</p>
					<div class="card-footer">
						<span class="cta-text">시작하기</span>
						<span class="arrow">→</span>
					</div>
				</div>
			</a>
		{/each}
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
		max-width: 1400px;
		margin: 0 auto;
		padding: 4rem 2rem;
		min-height: calc(100vh - 72px);
	}

	.hero {
		text-align: center;
		margin-bottom: 4rem;
		animation: fadeInDown 0.8s ease-out;
	}

	@keyframes fadeInDown {
		from {
			opacity: 0;
			transform: translateY(-30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.hero-title {
		font-size: clamp(2.5rem, 6vw, 4.5rem);
		font-weight: 800;
		margin: 0 0 1rem 0;
		line-height: 1.2;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			"Helvetica Neue", sans-serif;
	}

	.gradient-text {
		background: linear-gradient(
			135deg,
			#6366f1 0%,
			#8b5cf6 50%,
			#ec4899 100%
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		display: inline-block;
		animation: gradientShift 3s ease infinite;
	}

	@keyframes gradientShift {
		0%,
		100% {
			filter: hue-rotate(0deg);
		}
		50% {
			filter: hue-rotate(20deg);
		}
	}

	.ai-text {
		color: white;
		display: inline-block;
		margin-left: 0.5rem;
	}

	.hero-subtitle {
		font-size: clamp(1.1rem, 2vw, 1.5rem);
		color: #e2e8f0;
		font-weight: 400;
		margin: 0;
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
		gap: 2.5rem;
		animation: fadeInUp 0.8s ease-out 0.2s both;
		max-width: 900px;
		margin: 0 auto;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.feature-card {
		position: relative;
		background: rgba(30, 41, 59, 0.7);
		backdrop-filter: blur(10px);
		border-radius: 24px;
		padding: 2.5rem;
		text-decoration: none;
		color: white;
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		border: 1px solid rgba(255, 255, 255, 0.1);
		cursor: pointer;
	}

	.feature-card::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--gradient);
		opacity: 0;
		transition: opacity 0.4s ease;
		z-index: 0;
	}

	.feature-card:hover::before {
		opacity: 0.15;
	}

	.feature-card:hover {
		transform: translateY(-8px) scale(1.02);
		border-color: rgba(255, 255, 255, 0.3);
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.4),
			0 0 40px rgba(99, 102, 241, 0.3);
	}

	.card-glow {
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: var(--gradient);
		opacity: 0;
		filter: blur(40px);
		transition: opacity 0.4s ease;
		z-index: 0;
	}

	.feature-card:hover .card-glow {
		opacity: 0.2;
	}

	.card-content {
		position: relative;
		z-index: 1;
	}

	.icon-wrapper {
		width: 80px;
		height: 80px;
		background: var(--gradient);
		border-radius: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.5rem;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
		transition: transform 0.4s ease;
	}

	.feature-card:hover .icon-wrapper {
		transform: scale(1.1) rotate(5deg);
	}

	.feature-icon {
		font-size: 2.5rem;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.feature-title {
		font-size: 1.75rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: white;
	}

	.feature-description {
		font-size: 1.05rem;
		line-height: 1.6;
		color: #e2e8f0;
		margin: 0 0 2rem 0;
		min-height: 3.2rem;
	}

	.card-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.cta-text {
		font-weight: 600;
		font-size: 1.1rem;
		background: var(--gradient);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.arrow {
		font-size: 1.5rem;
		transition: transform 0.3s ease;
		color: white;
	}

	.feature-card:hover .arrow {
		transform: translateX(8px);
	}

	@media (max-width: 768px) {
		main {
			padding: 2rem 1rem;
		}

		.hero {
			margin-bottom: 2.5rem;
		}

		.features-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.feature-card {
			padding: 2rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.feature-card,
		.icon-wrapper,
		.arrow {
			transition: none;
		}

		.hero,
		.features-grid {
			animation: none;
		}
	}
</style>
