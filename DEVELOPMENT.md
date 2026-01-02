# 개발 가이드

## 프로젝트 구조

```
kmj_legend_ai_world/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte          # 네비게이션 바 포함 레이아웃
│   │   ├── +page.svelte            # 메인 페이지 (이미지 예측)
│   │   └── train/
│   │       └── +page.svelte        # 학습 대시보드
│   ├── lib/
│   │   └── assets/                 # 정적 에셋
│   └── app.html                    # HTML 템플릿
├── static/                         # 정적 파일
├── package.json
└── vite.config.ts
```

## 주요 컴포넌트

### 1. Navigation (`+layout.svelte`)
- 전역 네비게이션 바
- 라우트 간 이동
- 그라디언트 배경

### 2. Image Prediction Page (`/+page.svelte`)
**기능:**
- 파일 업로드로 이미지 예측
- 280x280 캔버스에서 직접 그리기
- 28x28로 자동 다운스케일
- 실시간 예측 결과 표시

**주요 함수:**
- `handleFileSelect()` - 파일 업로드 처리
- `processImage()` - 이미지 처리 및 정규화
- `getPrediction()` - API 예측 요청
- `startDrawing()`, `draw()`, `stopDrawing()` - 캔버스 그리기
- `recognizeDrawing()` - 캔버스 내용 인식

### 3. Training Dashboard (`/train/+page.svelte`)
**기능:**
- WebSocket 실시간 연결
- 모델 학습 제어
- 하이퍼파라미터 최적화
- 모델 테스트 및 평가

**주요 함수:**
- `connectWebSocket()` - WebSocket 연결 및 자동 재연결
- `handleWebSocketMessage()` - 실시간 데이터 처리
- `startTraining()` - 학습 시작
- `stopTraining()` - 학습 중지
- `testModel()` - 모델 테스트
- `startOptimization()` - 최적화 시작
- `reloadModel()` - 모델 재로드
- `fetchBestConfig()` - 최적 설정 로드

**상태 관리 (Svelte 5 Runes):**
```typescript
let isConnected = $state(false);        // WebSocket 연결 상태
let isTraining = $state(false);         // 학습 진행 여부
let isOptimizing = $state(false);       // 최적화 진행 여부
let trainingHistory = $state([]);       // 학습 이력
let optimizationResults = $state([]);   // 최적화 결과
```

## API 통신

### REST API
```typescript
const API_BASE = 'http://localhost:8000';

// GET 요청
const response = await fetch(`${API_BASE}/network/best-config`);
const data = await response.json();

// POST 요청
const response = await fetch(`${API_BASE}/network/train`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ eta: 0.01, l2_lambda: 0.0001, save_model: true })
});
```

### WebSocket
```typescript
const ws = new WebSocket('ws://localhost:8000/ws/training');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // 데이터 처리
};

// 자동 재연결
ws.onclose = () => {
  setTimeout(connectWebSocket, 3000);
};
```

## 스타일링 가이드

### 색상 팔레트
- **Primary**: `#667eea` → `#764ba2` (그라디언트)
- **Success**: `#10b981` (녹색)
- **Danger**: `#ef4444` (빨간색)
- **Background**: `#f3f4f6` (연한 회색)
- **Text**: `#1f2937` (진한 회색)

### 반응형 디자인
```css
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
```

### 레이아웃 패턴
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.card.full-width {
  grid-column: 1 / -1;
}
```

## 이미지 정규화 로직

```typescript
// 1. Canvas에서 이미지 데이터 추출
const imageData = ctx.getImageData(0, 0, 28, 28).data;

// 2. RGB를 Grayscale로 변환 및 정규화
const normalizedPixels: number[] = [];
for (let i = 0; i < imageData.length; i += 4) {
  const grayscale = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
  normalizedPixels.push(1.0 - grayscale / 255.0);
}

// 결과: 784개 픽셀 배열 (0.0 ~ 1.0)
// 0.0 = 흰색 배경
// 1.0 = 검은색 전경
```

## 개발 워크플로우

### 1. 로컬 개발
```bash
# 개발 서버 시작
npm run dev

# 타입 체크
npm run check

# 타입 체크 (watch 모드)
npm run check:watch
```

### 2. 백엔드 연동 테스트
백엔드 서버가 실행 중이어야 합니다:
```bash
# 백엔드 디렉토리에서
python -m uvicorn main:app --reload
```

### 3. 프로덕션 빌드
```bash
# 빌드
npm run build

# 미리보기
npm run preview
```

## 디버깅 팁

### WebSocket 연결 문제
```typescript
// 브라우저 콘솔에서 확인
ws.readyState
// 0: CONNECTING
// 1: OPEN
// 2: CLOSING
// 3: CLOSED
```

### API 에러 처리
```typescript
try {
  const res = await fetch(`${API_BASE}/network/train`, {...});
  const data = await res.json();
  
  if (res.ok) {
    // 성공
  } else {
    errorMessage = data.error; // 에러 메시지 표시
  }
} catch (error) {
  // 네트워크 에러
  errorMessage = '요청 실패';
}
```

### 상태 확인
```javascript
// 브라우저 콘솔에서
console.log('Training:', isTraining);
console.log('History:', trainingHistory);
console.log('Results:', optimizationResults);
```

## 새로운 기능 추가하기

### 1. 새 페이지 추가
```bash
mkdir -p src/routes/new-page
touch src/routes/new-page/+page.svelte
```

### 2. 새 API 엔드포인트 연동
```typescript
async function newApiCall() {
  const res = await fetch(`${API_BASE}/new-endpoint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: value })
  });
  
  const data = await res.json();
  // 처리
}
```

### 3. WebSocket 데이터 타입 추가
```typescript
function handleWebSocketMessage(data: any) {
  if (data.newDataType) {
    // 새 데이터 타입 처리
  }
}
```

## 성능 최적화

### 1. 이미지 처리
- Canvas 재사용
- 불필요한 다시 그리기 방지

### 2. 상태 업데이트
- 배치 업데이트 사용
- 불필요한 반응성 피하기

### 3. WebSocket
- 메시지 쓰로틀링
- 자동 재연결 지연 시간 조절

## 테스트 시나리오

### 이미지 예측
1. 파일 업로드 → 예측 결과 확인
2. 캔버스에 숫자 그리기 → 인식하기
3. 다양한 이미지 형식 테스트

### 모델 학습
1. WebSocket 연결 확인
2. 학습 시작 → 실시간 진행 상황 확인
3. 학습 중지 → 상태 변경 확인
4. 학습 완료 → 모델 자동 재로드

### 최적화
1. 작은 조합으로 테스트 (2-3개)
2. 실시간 결과 표시 확인
3. 최적화 완료 → 전체 결과 테이블 확인

## 문제 해결

### "WebSocket 연결 실패"
- 백엔드 서버 실행 여부 확인
- CORS 설정 확인
- 포트 번호 확인 (8000)

### "모델이 현재 학습 중입니다"
- `/network/train/status` 엔드포인트로 상태 확인
- 필요시 서버 재시작

### 빌드 에러
```bash
# 캐시 삭제
rm -rf .svelte-kit node_modules
npm install
npm run build
```

## 기여하기

1. 기능 브랜치 생성
2. 변경사항 커밋
3. 타입 체크 및 빌드 확인
4. Pull Request 생성

## 참고 자료

- [SvelteKit 문서](https://kit.svelte.dev/docs)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
