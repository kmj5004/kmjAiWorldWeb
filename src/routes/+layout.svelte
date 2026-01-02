<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	<div class="nav-container">
		<a href="/" class="nav-logo">🧠 민재의 AI 세상</a>
		<div class="nav-links">
			<a href="/" class="nav-link">홈</a>
			<a href="/mnist" class="nav-link">숫자 인식 & 학습</a>
			<a href="/tictactoe" class="nav-link">🎮 보드 게임</a>
		</div>
	</div>
</nav>

{@render children()}

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			"Helvetica Neue", sans-serif;
	}

	nav {
		background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
		padding: 1rem 2rem;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(10px);
		position: sticky;
		top: 0;
		z-index: 1000;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.nav-container {
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.nav-logo {
		font-size: 1.5rem;
		font-weight: 800;
		color: white;
		text-decoration: none;
		transition: all 0.3s ease;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.nav-logo:hover {
		filter: brightness(1.2);
		transform: scale(1.05);
	}

	.nav-links {
		display: flex;
		gap: 0.5rem;
	}

	.nav-link {
		color: #e2e8f0;
		text-decoration: none;
		font-weight: 500;
		padding: 0.6rem 1.2rem;
		border-radius: 10px;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.nav-link::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: -1;
	}

	.nav-link:hover {
		color: white;
		transform: translateY(-2px);
	}

	.nav-link:hover::before {
		opacity: 1;
	}

	@media (max-width: 768px) {
		nav {
			padding: 0.75rem 1rem;
		}

		.nav-container {
			flex-direction: column;
			gap: 1rem;
		}

		.nav-logo {
			font-size: 1.25rem;
		}

		.nav-links {
			gap: 0.25rem;
			flex-wrap: wrap;
			justify-content: center;
		}

		.nav-link {
			padding: 0.5rem 0.8rem;
			font-size: 0.9rem;
		}
	}
</style>
