<div align="center">
  <h1>국가 탐색기</h1>
  
  <p>
    로그인 기반 점수 경쟁형 슬라이딩 퍼즐 웹 애플리케이션입니다.
    사용자는 난이도(3x3, 4x4, 5x5)를 선택해 퍼즐을 완주하고, 시간/이동/힌트 사용량이 반영된 점수로 랭킹을 경쟁합니다.
  </p>

  <p>
    <a href="https://sliding-puzzle-gyulo94.vercel.app/">
      <img src="https://img.shields.io/badge/바로_체험하기-black?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo">
    </a>
    &nbsp;
    <a href="https://github.com/Gyulo94/sliding-puzzle/stargazers">
      <img src="https://img.shields.io/github/stars/gyulo94/country-explorer?style=for-the-badge" alt="GitHub stars">
    </a>
  </p>
</div>

### ✨ 주요 기능

#### 1. 인증

- 회원가입
- 로그인

#### 2. 게임

- 난이도: 3x3(초급), 4x4(중급), 5x5(고급)
- 이미지 선택: 업로드 또는 난이도별 랜덤 이미지
- 실시간 상태: 시간, 이동 횟수, 힌트 횟수 추적
- 완주 시 점수 계산 및 결과 모달 출력

#### 3. 랭킹

- 난이도별 랭킹 조회, 페이지네이션 지원
- 내 최고 순위 조회
- 동점 처리 기준:
  1. 점수 내림차순
  2. 시간 오름차순
  3. 이동 횟수 오름차순
  4. 힌트 횟수 오름차순
  5. 달성 시각 오름차순

#### 4. 점수 계산 방식

- 기준점수: 난이도별 고정점수
  - 3x3: 10000
  - 4x4: 14000
  - 5x5: 18000
- 감점: 시간, 이동, 힌트 사용량 기반
- 가산점: 감쇠함수 기반 보너스

### 핵심 구현 포인트

#### 퍼즐이 항상 풀리도록 보장한 셔플

핵심 아이디어: 무작위 배열 생성이 아니라, 빈칸 기준 "유효한 이동"을 반복 적용해 시작 상태를 만듭니다.

참고 코드: [src/game/engine.js](src/game/engine.js#L50)

- "랜덤 배열" 대신 "합법 수열" 기반이라 불가능 퍼즐이 나오지 않습니다.

#### 힌트 탐색: IDA\*

핵심 아이디어: 휴리스틱 탐색으로 다음 수를 찾되, 시간/노드 상한을 둬 브라우저 멈춤을 방지합니다.

참고 코드: [src/game/engine.js](src/game/engine.js#L81)

- IDA\*를 사용해 메모리 사용량을 낮추면서도 꽤 정확한 힌트를 제공합니다.
- 제한 시간을 둬 UX 품질(반응성)을 우선합니다.

#### 점수체계의 설명 가능성

핵심 아이디어: 점수를 단순 숫자로만 보여주지 않고 계산 근거를 공개합니다.

참고 코드: [src/modules/scoring.js](src/modules/scoring.js)

- 시간/이동/힌트가 어떻게 점수에 반영되는지 사용자가 해석할 수 있습니다.
- 동일 산식을 클라이언트/서버 모두 사용해 신뢰도를 유지합니다.

#### 랭킹 페이지네이션 + 캐시 전략

핵심 아이디어: 페이지별 순위를 정확히 표시하고, 최초 조회 후에는 캐시를 재사용해 불필요한 API 호출을 줄입니다.

참고 코드: [src/app/rankingController.js](src/app/rankingController.js)

- 랭킹 보기 시 이미 조회한 난이도/페이지는 캐시 데이터를 즉시 표시합니다.
- 새로고침 버튼을 누를 때만 캐시를 무효화하고 서버에서 다시 조회합니다.
- 랭킹 번호는 `(현재페이지-1) * 페이지크기 + 1` 기준으로 일관되게 계산합니다.

#### 결과 모달의 피드백 UX

핵심 아이디어: 최고기록 갱신 여부를 메시지로 즉시 피드백합니다.

참고 코드: [src/app/endPanelView.js](src/app/endPanelView.js)

- 기능 성공/실패가 아닌 "도전-성취" 맥락의 감정 피드백을 제공합니다.
- `rankingUpdated` 응답값을 UI와 직접 연결해 메시지의 신뢰성을 확보했습니다.

### 🛠 기술 스택

- **HTML5 + Tailwind CSS** (CDN)
- **로컬스토리지** (테마 저장)
- **배포**: Vercel

### 🚀 바로 체험하기

**[슬라이딩 퍼즐 데모](https://sliding-puzzle-gyulo94.vercel.app/)**

### 설치 & 로컬 실행

```bash
# 1. 저장소 클론
git clone https://github.com/Gyulo94/sliding-puzzle
cd sliding-puzzle

# 2. 실행 (가장 편한 방법)
# VS Code → Live Server 확장 프로그램 열기
# 또는 index.html을 브라우저에서 직접 열기
📂 파일 구조
├── index.html # 메인 HTML
├── js/
│   ├── config.js # regionMap, subregionMap, capitalKorean, languageMap
│   ├── utils.js # getKoreanCapital, getKoreanRegion, getKoreanLanguages, getSafeFlagUrl 등
│   ├── map.js # Leaflet 관련 모든 함수 (initWorldMap, initMap, showCard 등)
│   └── main.js # 데이터 로드, 이벤트, render 함수 등
└── README.md
```
