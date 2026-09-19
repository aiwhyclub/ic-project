# 이천 세이브포인트 디자인 시스템

상태: 확정 (2026-09-19 사용자 시안 승인)

## 0. Research Log

- User references: Ramp Travel, Trawelt, Duffel, Supahero, Navbar Gallery, Bento Grids, H1 Gallery, CTA Gallery, Footer Design, Component Gallery를 2026-09-16에 확인했습니다.
- Direction: 사용자가 승인한 세라믹 에디토리얼 방향을 유지합니다. Ramp의 기능 중심 여백, Trawelt의 에디토리얼 대비, Duffel의 명확한 CTA 구조를 조합하되 상표·문구·이미지는 복제하지 않습니다.
- Product contract: `docs/prd.md`, `docs/design-prompt.md`, `docs/research/map-provider-feasibility.md`.
- Lazyweb skipped: 사용자가 구체적인 실사이트 레퍼런스를 이미 제공했습니다.
- Imagen drafts: `design/01-ai-curation-home.png`부터 `design/07-plan-b.png`까지 생성하고 Screen 1을 스타일 기준으로 삼습니다.
- Figma skipped: 이번 요청은 직접 시안과 Google Stitch 병행입니다.
- Typography reference: `design/qa/pretendard-weight-reference.png`를 기준으로 Pretendard Bold 700·SemiBold 600·Regular 400·Medium 500 위계를 적용했습니다.

## 1. Atmosphere & Identity

박물관 도록처럼 차분하고 촉각적인 여행 계획 도구입니다. 넉넉한 유약 아이보리 여백 위에 먹색 정보와 청자 녹색 행동을 배치합니다. 기억에 남는 장면은 AI 큐레이션 홈의 청자 오브젝트입니다. 도자기 조각의 윤곽이 이천 여행 경로로 이어지고, 아래의 세 동선 카드가 실제 계획으로 연결됩니다. 장식은 홈에 집중하고 지도·여행 화면은 판독성과 속도를 우선합니다.

## 2. Color

### Palette

| Role | Token | Value | Usage |
| --- | --- | --- | --- |
| Canvas | `--surface-canvas` | `#F5F1E8` | 전체 배경 |
| Surface | `--surface-primary` | `#FBF9F3` | 카드·패널 |
| Surface muted | `--surface-muted` | `#E8E3D8` | 비활성·스켈레톤 |
| Text primary | `--text-primary` | `#171A18` | 제목·본문 |
| Text secondary | `--text-secondary` | `#5D625D` | 설명·메타데이터 |
| Border | `--border-default` | `rgba(23,26,24,0.16)` | 1px 경계선 |
| Accent | `--accent-primary` | `#1F6A5C` | CTA·선택·현재 위치 |
| Accent soft | `--accent-soft` | `#D8E9E3` | 선택 배경·정보 강조 |
| Success | `--status-success` | `#27734F` | 저장 성공 |
| Warning | `--status-warning` | `#9A6418` | 오래된 정보·조건부 경로 |
| Error | `--status-error` | `#A43B32` | 실패·파괴 행동 |
| Info | `--status-info` | `#315C70` | 공급자·갱신 정보 |

### Rules

- 청자 녹색은 행동과 선택에만 사용하고 장식 면적을 과도하게 늘리지 않습니다.
- 상태는 색상만으로 구분하지 않고 아이콘·선 모양·문구를 함께 사용합니다.
- 순백과 순흑의 넓은 면은 사용하지 않습니다.

## 3. Typography

| Level | Mobile | Desktop | Weight | Line height | Usage |
| --- | --- | --- | --- | --- | --- |
| Display | 44~56px | 72~96px | 700 | 1.05~1.15 | 큰 제목·홈 Hero |
| H1 | 34px | 52px | 700 | 1.15 | 큰 화면 제목 |
| H2 | 26px | 34px | 600 | 1.25 | 섹션 제목 |
| H3 | 20px | 22px | 600 | 1.35 | 단계명·핵심 항목·카드 제목 |
| Body/lg | 18px | 18px | 400 | 1.6 | 리드 문장 |
| Body | 16px | 16px | 400 | 1.6 | 기본 본문 |
| Body/sm | 14px | 14px | 400 | 1.5 | 메타데이터 |
| Caption | 12px | 12px | 500 | 1.4 | 상태·출처 |

CSS token mapping: `--type-h1-mobile`, `--type-h1-desktop`, `--type-h2-mobile`, `--type-h2-desktop`, `--type-h3-mobile`, `--type-h3-desktop`, `--type-body-lg`, `--type-body`, `--type-body-sm`, `--type-caption`, `--weight-bold`, `--weight-semibold`, `--weight-medium`, `--weight-regular`, `--leading-h1`, `--leading-h2`, `--leading-h3`, `--leading-body`, `--leading-caption`.

- Single family: Pretendard Variable, system-ui, sans-serif
- Weight mapping: 큰 제목 Bold 700, 단계명·핵심 항목 SemiBold 600, 본문 설명 Regular 400, 짧은 보조 표기 Medium 500
- 모든 한글·영문 UI 문구를 Pretendard 계열로 통일하고 별도 세리프 폰트를 사용하지 않습니다.
- 숫자·시간: Pretendard Variable의 tabular numeral 기능을 우선합니다.
- 한 문단의 최대 폭은 65ch입니다.

## 4. Spacing & Layout

### Spacing scale

| Token | Value | Usage |
| --- | --- | --- |
| `--space-1` | 4px | 아이콘 내부 |
| `--space-2` | 8px | 라벨·아이콘 |
| `--space-3` | 12px | 컴팩트 행 |
| `--space-4` | 16px | 모바일 여백 |
| `--space-5` | 20px | 태블릿 여백 |
| `--space-6` | 24px | 카드 패딩·PC 거터 |
| `--space-8` | 32px | 카드 그룹 |
| `--space-10` | 40px | 화면 내 섹션 |
| `--space-12` | 48px | 주요 섹션 |
| `--space-16` | 64px | 페이지 리듬 |
| `--space-20` | 80px | Hero |

### Grid and breakpoints

- Mobile: 0~767px, 4 columns, 16px margins and gaps
- Tablet: 768~1023px, 8 columns, 20px margins and gaps
- Desktop: 1024px+, 12 columns, 24px gaps, max content width 1440px
- Map desktop: route panel 380~480px, remaining width for map
- Map mobile: full map with bottom sheet at 42vh, expandable to 82vh
- No horizontal scrolling for primary content.

## 5. Components

### App Shell
- Structure: brand, Kakao Map source badge, primary navigation, account action
- Variants: public, authenticated, travel-minimal
- States: default, focused item, mobile menu open
- Accessibility: skip link, visible focus, mobile menu focus trap

### Primary CTA
- Structure: text label plus optional directional icon
- Variants: filled accent, outline secondary, destructive error
- States: default, hover, active, focus, disabled, loading
- Motion: 140ms translate/opacity feedback, no glow

### Curated Route Card
- Structure: 4:3 image, audience, title, mode, duration, place list, reason, explicit view button
- Variants: featured large card, compact card
- States: default, hover, focus, selected, loading skeleton, fallback-data badge
- Accessibility: card is not the only click target; button has an explicit label

### Map Split Pane
- Structure: itinerary panel, Kakao Map canvas, source labels, fixed save action
- Variants: desktop split, mobile map with bottom sheet
- States: calculating, calculated, partial-route error, provider failure, unsaved, saved
- Accessibility: itinerary duplicates marker content; order changes via drag and buttons

### Place Information Panel
- Structure: image, verified date, operating status, facts, reason, add action
- Variants: quick panel, full detail
- States: loading, verified base data, live data, live-data failure

### Public Catalog Card
- Structure: category or audience label, title, concise facts, verified date when applicable
- Variants: place card on `--surface-primary`, curation card on `--accent-soft`
- States: ready, empty collection, data unavailable
- Accessibility: cards are semantic articles; the surrounding section owns the heading and item count
- Surface: 20px radius, 1px `--border-default`, no floating shadow

### OAuth Card
- Structure: contextual reason, official Google button, official Kakao button, privacy copy
- States: default, redirecting, callback, provider error, cancelled
- Accessibility: official labels, error summary focus, return focus to caller

### Saved Route Card
- Structure: title, date, companion, mode, modified time, open/edit/delete actions
- States: loading, empty, default, delete confirmation, query failure

### Plan B Card
- Structure: 4:3 image, reason, travel time, operation condition, verification state, choose action
- States: default, selected, unavailable, live-data failure

### Status Banner
- Structure: icon, concise message, timestamp, primary recovery action
- Variants: info, warning, error, success
- Accessibility: polite live region except destructive blocking errors

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
| --- | --- | --- | --- |
| Micro | 120~160ms | ease-out | press, focus, toggle |
| Standard | 180~260ms | cubic-bezier(0.2,0.8,0.2,1) | panel, bottom sheet, tabs |
| Emphasis | 500~900ms | cubic-bezier(0.16,1,0.3,1) | Hero sequence |

- Hero order: headline → route line → Three.js celadon object → CTA → curated cards.
- GSAP and Three.js run only on the AI curation home.
- Only transform and opacity animate.
- Hero rendering pauses offscreen.
- `prefers-reduced-motion` uses a static GPT-Image-2.5 Sunburst poster and instant state changes.

## 7. Depth & Surface

- Strategy: mixed, led by tonal shifts and hairline borders.
- Standard cards use `--surface-primary`, a 1px border, and no floating shadow.
- Selected cards use `--accent-soft` plus a 2px accent inset ring.
- Only OAuth modal, bottom sheet, and Hero focal object receive a low broad shadow.
- Radii: 16px compact cards, 20px standard cards, 24px Hero and modal.
- CSS radius tokens: `--radius-compact`, `--radius-card`, `--radius-hero`, `--radius-pill`.
- Material: matte paper and glazed ceramic, never glassmorphism or neon.

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- WCAG 2.2 AA target.
- Body contrast 4.5:1 minimum and large text 3:1 minimum.
- Touch targets at least 44px.
- Every marker has a matching list item.
- Every drag action has move-up and move-down controls.
- Modal and bottom sheet manage focus and restore it on close.
- Loading, empty, error, stale, and live-data states are conveyed without color-only meaning.
- Korean text must not clip at 200% zoom.
- Kakao Map and optional TMAP attribution remain visible under their respective terms.

### Accepted Debt

No design debt is accepted before the first rendered mockup review. Static mockups may imply interactions, but keyboard, screen-reader, live map, OAuth, and provider API behavior remain unverified until implementation.
