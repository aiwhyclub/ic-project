# Google Stitch 화면 생성 프롬프트

## 공통 입력

Upload or paste the root `DESIGN.md` first. Apply it as the single visual contract for every screen below.

Global product: “이천 세이브포인트”, a responsive Korean web app for first-time day-trip visitors to Icheon. Use Korean UI copy. Visual mood is ceramic editorial: warm glaze ivory canvas `#F5F1E8`, charcoal ink `#171A18`, deep celadon CTA `#1F6A5C`, pale celadon selection `#D8E9E3`. Use Pretendard Variable as the single font family across every screen: Bold 700 for large titles, SemiBold 600 for steps and core items, Regular 400 for body descriptions, Medium 500 for short supporting labels. Do not use serif fonts. No purple gradients, neon glow, generic dashboard charts, emojis, or glassmorphism.

For each request generate one desktop screen at 1440×1024 and one mobile screen at 390×844. Keep identical product identity across all screens. The map UI is always Kakao Map. TMAP appears only as an optional route-source label or external fallback when enabled.

## Screen 1 — AI 큐레이션 홈

Create the pre-login AI curation home. Use an off-grid editorial Hero, not a generic centered SaaS layout. Show the exact Korean headline “이천의 하루를, 길부터 골라보세요.” with one deep-celadon primary CTA “새 동선 만들기”. Include a sculptural celadon ceramic object whose contour becomes a route line, implying a Three.js scene. Below it, show three asymmetric curated route cards with the exact labels “공예와 카페”, “가족 체험”, “시장과 산책”. Each card shows audience, transit mode, estimated duration, 3–4 place names, recommendation reason, and a clear “동선 보기” button. Include Kakao Map attribution and a compact public navigation. Show a subtle fallback-data badge on one card. Desktop uses an asymmetric Bento rhythm; mobile stacks all three cards in one column.

## Screen 2 — 지도 동선 계획

Create the route planning workspace using Kakao Map as the only map canvas. Desktop: a 420px itinerary panel on the left and a large map on the right. Mobile: full map with a 42vh bottom sheet and a fixed “동선 저장” CTA. Show ordered places, walking/car/transit tabs, move-up/down buttons, drag handles, add/remove controls, route times, Kakao Map source, and an optional small route-source label for approved TMAP fallback. Include a quick place-information panel and a visible “마지막 계산 10:42” status. Show one partial-route warning without deleting the itinerary. Do not add decorative Three.js art.

## Screen 3 — 장소 상세

Create a place detail screen for “이천 세라피아”. Use a strong 4:3 editorial image placeholder, place facts, address, contact, operating hours, closure day, reservation requirement, parking, expected stay, recommendation reason, source, and verification date. Primary CTA is “코스에 추가”. Include a “실시간 정보 반영” control with a visible fallback message demonstrating that live information failed and verified base information is shown instead. Desktop uses a 40/60 image-information composition; mobile puts operation status and CTA before the accordion details.

## Screen 4 — Supabase OAuth 로그인

Create a contextual OAuth sign-in screen opened from route saving. Exact headline: “이 동선을 저장하려면 로그인하세요.” Show a short explanation that the current plan will be preserved. Use official-looking, unmodified Google and Kakao login buttons as separate full-width actions. Include minimum-data and account-deletion policy links. Desktop appears as a centered authentication card over a muted glimpse of the route workspace; mobile is a focused full-screen flow. Include a subtle back action and a provider-error state area without alarming styling.

## Screen 5 — 마이페이지

Create an authenticated saved-routes page. Use an asymmetric Bento layout on desktop and a single recent-first list on mobile. Show “새 동선 만들기”, three believable saved route cards with name, travel date, companion type, transit mode, last modified time, and open/edit/delete actions. Include a compact account settings card with logout and a clearly separated destructive “계정과 저장정보 삭제” action. Footer contains only policies, sources, and Kakao Map attribution. Include an empty-state composition in a secondary panel.

## Screen 6 — 저장 동선 상세·여행

Create a saved-route travel screen. Immediately show the stored place order while the Kakao route is being recalculated. Include route-source attribution, segment-by-segment progress, latest distance/time, current and next place, operating warnings, “여행 시작” primary CTA, edit action, and Plan B entry. Demonstrate one route segment still calculating and one completed segment. Desktop splits itinerary and map; mobile pins the current segment and next action above a single-column timeline.

## Screen 7 — 플랜B

Create the urgent Plan B replacement screen designed for a decision within 60 seconds. First show a clear location-permission explanation and manual Icheon-area selection fallback. Present exactly three alternative place cards with image, recommendation reason, travel time and method, operating/reservation/market-day conditions, and verified/live information state. Desktop compares all three cards horizontally. Mobile uses a single vertical ranked list, never a horizontal carousel. One unmistakable primary action reads “이 장소로 교체”. Include a live-data failure fallback message and a save-retry state.
