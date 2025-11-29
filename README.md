# Neural Network API - 사용 가이드

이 프로젝트는 세 가지 다른 신경망 아키텍처를 사용하여 MNIST 손글씨 숫자를 예측하는 FastAPI 기반 API와, 이미지를 업로드하고 예측을 시도하는 Svelte 프런트엔드로 구성됩니다.

프런트엔드 경로: 이 저장소 (SvelteKit)
백엔드 경로: 별도 FastAPI 서비스 (로컬 8000 포트, 예: `uvicorn main:app --reload`)

아래 가이드는 API 사양, 모델 상태, 실행 및 테스트 방법을 설명합니다.

## 네트워크 종류

### Network 1
- 파일: `src/network.py`
- 특징: PyTorch 기반 기본 신경망
- 모델 파일: `trained_network.pkl`
- 상태: ✅ 학습된 모델 사용 가능

### Network 2
- 파일: `src/network2.py`
- 특징: 교차 엔트로피 비용 함수와 정규화를 사용하는 개선된 신경망
- 모델 파일: `trained_network2.json`
- 상태: ⚠️ 학습되지 않은 상태 (학습 필요)

### Network 3
- 파일: `src/network3.py`
- 특징: PyTorch 기반 컨볼루션 신경망 (CNN)
- 모델 파일: 레이어 아키텍처 정의 필요
- 상태: ⚠️ 초기화 필요

## API 엔드포인트

서버 기본 URL: `http://127.0.0.1:8000`

1. 루트 엔드포인트
   - `GET /`
   - 서버 상태를 확인합니다.

2. Network 1 예측
   - `POST /network1/predict`
   - `Content-Type: application/json`
   - 요청 본문 예시:
     ```json
     { "image": [0.0, 0.0, 0.0] }
     ```
     실제로는 28x28 = 784개의 값이 필요합니다.
   - 응답 예시:
     ```json
     { "prediction": 5 }
     ```

3. Network 2 예측
   - `POST /network2/predict`
   - `Content-Type: application/json`
   - 요청 본문 예시:
     ```json
     { "image": [0.0, 0.0, 0.0] }
     ```
   - 응답 예시:
     ```json
     { "prediction": 3 }
     ```

4. Network 3 예측
   - `POST /network3/predict`
   - `Content-Type: application/json`
   - 요청 본문 예시:
     ```json
     { "image": [0.0, 0.0, 0.0] }
     ```
   - 현재 상태: Network 3은 초기화되지 않아 에러 메시지를 반환합니다.
     ```json
     { "error": "Network 3 is not initialized. Requires specific layer architecture." }
     ```

## 서버 실행

백엔드(FastAPI):

```bash
# 가상 환경 활성화 (이미 활성화된 경우 생략)
source .venv/bin/activate

# 서버 실행
uvicorn main:app --reload
```

서버는 기본적으로 `http://127.0.0.1:8000`에서 실행됩니다.

프런트엔드(SvelteKit):

```bash
npm install
npm run dev
# 또는 브라우저 자동 열기
npm run dev -- --open
```

프런트엔드 예측 요청은 기본적으로 `http://localhost:8000/network1/predict`로 전송됩니다. 필요 시 `.svelte` 파일에서 엔드포인트를 변경하세요.

## API 문서

백엔드 서버 실행 후 자동 생성된 API 문서를 확인할 수 있습니다:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## 테스트

방법 1: 테스트 스크립트 실행

```bash
python test_networks.py
```

이 스크립트는 각 네트워크를 테스트하고 결과를 출력합니다.

방법 2: HTTP 파일 사용

JetBrains IDE (PyCharm, IntelliJ 등)에서 `test_main.http` 파일을 열고 각 요청을 실행할 수 있습니다.

방법 3: curl 사용

```bash
# Network 1 테스트 (예시: 최소 길이 샘플 — 실제로는 784개 값 필요)
curl -X POST "http://127.0.0.1:8000/network1/predict" \
  -H "Content-Type: application/json" \
  -d '{"image": [0.0, 0.0, 0.0] }'

# Network 2 테스트 (예시)
curl -X POST "http://127.0.0.1:8000/network2/predict" \
  -H "Content-Type: application/json" \
  -d '{"image": [0.0, 0.0, 0.0] }'
```

## 모델 학습

### Network 2 학습

```bash
python train_network.py --network 2
```

학습된 모델은 `trained_network2.json`으로 저장됩니다.

### Network 3 학습

Network 3를 사용하려면 먼저 레이어 아키텍처를 정의하고 학습해야 합니다. 자세한 내용은 `TRAINING_GUIDE.md`를 참조하세요.

## 이미지 형식

- 모든 네트워크는 28x28 픽셀의 회색조 이미지를 입력으로 받습니다.
- 총 784개의 픽셀 값 (28 × 28 = 784)
- 각 값은 0.0 (검정색)에서 1.0 (흰색) 사이
- JSON 배열 형식으로 전달

프런트엔드 업로드 시, 클라이언트에서 이미지를 28x28로 다운스케일하고 0.0~1.0 범위로 정규화해 API에 전송합니다.

## 문제 해결

- Network 2가 정확하지 않은 예측을 합니다
  - Network 2는 학습되지 않은 상태입니다. `train_network.py`를 사용하여 모델을 학습시켜야 합니다.

- Network 3을 사용할 수 없습니다
  - Network 3은 특정 레이어 아키텍처가 필요합니다. `src/network3.py`를 참조하여 레이어를 정의하고 `main.py`를 업데이트해야 합니다.

- CORS 에러가 발생합니다
  - `main.py`의 `origins` 리스트에 프론트엔드 URL을 추가하세요:

    ```python
    origins = [
        "http://localhost:5173",
        "http://localhost",
        "http://your-frontend-url.com",  # 추가
    ]
    ```

## 참고 문서

- `QUICKSTART.md`: 빠른 시작 가이드
- `TRAINING_GUIDE.md`: 모델 학습 가이드
- `STUDY_GUIDE_KR.md`: 한국어 학습 가이드
- `CONVERSION_SUMMARY.md`: 변환 요약

## 라이선스

이 프로젝트는 교육 목적으로 사용됩니다.
