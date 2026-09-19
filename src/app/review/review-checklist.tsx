"use client";

import { useState } from "react";

type ReviewItem = Readonly<{
  id: string;
  title: string;
  detail: string;
  features: readonly string[];
  status?: string;
}>;

const SCREEN_ITEMS: readonly ReviewItem[] = [
  { id: "screen-home", title: "01 AI 큐레이션 홈", detail: "로그인 전에 이천 동선 3개를 비교하고 새 동선을 시작합니다.", features: ["추천 카드 3개", "1~3개 복수 선택", "새 동선 조건 입력"] },
  { id: "screen-plan", title: "02 지도 동선 계획", detail: "선택한 장소를 Kakao Map 기준으로 편집합니다.", features: ["장소 추가·삭제", "방문 순서·이동수단 변경", "구간별 경로 상태"] },
  { id: "screen-place", title: "03 장소 상세", detail: "운영·예약·주차·출처를 확인하고 코스에 추가합니다.", features: ["빠른 정보 패널", "독립 상세 화면", "출처·확인일"] },
  { id: "screen-auth", title: "04 OAuth 로그인", detail: "저장 시 Google·Kakao 로그인과 원래 작업 복귀를 확인합니다.", features: ["로그인 이유 안내", "PKCE 콜백 상태", "취소·실패 후 복귀"] },
  { id: "screen-mypage", title: "05 마이페이지", detail: "본인 일정의 목록·수정·삭제와 계정 삭제 영향을 확인합니다.", features: ["일정 카드", "삭제 확인", "세션·계정 삭제"] },
  { id: "screen-travel", title: "06 저장 동선·여행", detail: "장소 순서를 먼저 복원하고 최신 경로로 여행을 시작합니다.", features: ["경로 재계산", "현재·다음 장소", "플랜B 진입"] },
  { id: "screen-courses", title: "07 여행 코스 찾기", detail: "공개 큐레이션을 조건과 정렬로 탐색합니다.", features: ["키워드·필터", "결과 수·초기화", "조건 적합도 정렬"] },
  { id: "screen-map", title: "08 지도 보기", detail: "검증된 장소를 지도와 같은 정보의 목록으로 찾습니다.", features: ["Kakao Map 마커", "현재 영역 재검색", "상세·새 동선 연결"] },
  { id: "screen-plan-b", title: "09 현장 플랜B", detail: "막힌 이유와 위치를 기준으로 한 곳을 교체합니다.", features: ["동의 전 위치 안내", "정확히 3개 대체 카드", "교체 후 이후 구간 재계산"] },
];

const SUCCESS_ITEMS: readonly ReviewItem[] = [
  { id: "success-first", title: "사용자 성공 기준 1 · 여행 전", detail: "대중교통 친구·연인과 자가용 가족 각 5명 중 4명 이상이 로그인 전에 3개 동선을 보고 1~3개를 선택·편집하고, 저장 시 OAuth를 완료합니다.", features: ["선택 개수와 마이페이지 카드 수 일치", "삭제 즉시 목록에서 사라짐", "재열기 시 장소 순서 유지·경로 재계산"] },
  { id: "success-second", title: "사용자 성공 기준 2 · 현장", detail: "각 집단 5명 중 4명 이상이 대표 실패 상황에서 60초 안에 플랜B를 선택하고, 재계산 일정과 정보 상태를 이해합니다.", features: ["위치 거부 후 수동 선택", "기본 검증정보와 실시간 상태 구분", "교체된 장소와 이후 구간 확인"] },
];

const EXTERNAL_GAP_ITEMS: readonly ReviewItem[] = [
  { id: "gap-auth", title: "Supabase Google·Kakao OAuth", detail: "실제 client ID, redirect URL, PKCE 콜백과 두 provider 로그인을 자격증명 환경에서 확인해야 합니다.", features: ["현재 로컬 UI는 자격증명 없이 확인", "운영 전 콜백 URL 재검증"], status: "검증 전" },
  { id: "gap-kakao", title: "Kakao Map·Mobility 키와 쿼터", detail: "Web SDK·REST·Mobility 키, 허용 도메인, 일일 쿼터·비용은 현재 계정과 공식 약관으로 다시 확인해야 합니다.", features: ["지도 타일·경로 원문 저장 금지", "실패 시 장소 순서 유지"], status: "검증 전" },
  { id: "gap-gemini", title: "Gemini 추천 공급자", detail: "모델 ID·API 키·무료 한도와 추천 입력에서 개인정보를 제외하는 운영 규칙을 확인해야 합니다.", features: ["기본 큐레이션 3개 fallback", "AI 원문·현재 위치 로그 제외"], status: "검증 전" },
  { id: "gap-tmap", title: "TMAP 내부 교차 표시 약관", detail: "양사 약관·라이선스 승인 전에는 외부 TMAP 열기만 허용하고 앱 내부 경로 교차 표시는 보류합니다.", features: ["승인 근거 기록 필요", "승인 전 기능 미노출"], status: "검증 전" },
  { id: "gap-cloud", title: "Supabase Cloud RLS·보존 정책", detail: "실제 Cloud project에서 auth.uid() RLS, OAuth 사용자 데이터 삭제, 백업·보존 정책을 테스트해야 합니다.", features: ["service_role 서버 전용", "계정 삭제 후 재접근 불가"], status: "검증 전" },
];

const ALL_ITEMS = [...SCREEN_ITEMS, ...SUCCESS_ITEMS, ...EXTERNAL_GAP_ITEMS];

function ChecklistGroup({ title, items, checked, onToggle }: Readonly<{ title: string; items: readonly ReviewItem[]; checked: Readonly<Record<string, boolean>>; onToggle: (id: string) => void }>) {
  return (
    <section className="review-group" aria-labelledby={`review-${title}`}>
      <h2 id={`review-${title}`}>{title}</h2>
      <div className="review-item-list">
        {items.map((item) => (
          <label className={`review-item${checked[item.id] ? " is-checked" : ""}`} key={item.id}>
            <input type="checkbox" checked={checked[item.id] === true} onChange={() => onToggle(item.id)} />
            <span className="review-item-content">
              <span className="review-item-heading"><strong>{item.title}</strong>{item.status ? <em>{item.status}</em> : null}</span>
              <span>{item.detail}</span>
              <span className="review-feature-list">{item.features.map((feature) => <small key={feature}>{feature}</small>)}</span>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}

export function ReviewChecklist() {
  const [checked, setChecked] = useState<Readonly<Record<string, boolean>>>({});
  const checkedCount = ALL_ITEMS.filter((item) => checked[item.id] === true).length;

  function toggle(id: string) {
    setChecked((current) => ({ ...current, [id]: current[id] !== true }));
  }

  function markAll() {
    const next: Record<string, boolean> = {};
    for (const item of ALL_ITEMS) next[item.id] = true;
    setChecked(next);
  }

  function clearAll() {
    setChecked({});
  }

  return (
    <main className="app-canvas review-page" id="main-content">
      <div className="page-shell review-shell">
        <header className="review-header">
          <p className="eyebrow">PRD cross-check · STORY 11.12</p>
          <h1 className="review-title">구현된 여정과 남은 확인을 한 화면에서 점검하세요.</h1>
          <p className="review-lead">기준 문서: docs/prd.md §4·§7, docs/frd.md F9·F10. 체크는 브라우저 안에서만 유지하며 운영 승인이나 자격증명 검증을 대신하지 않습니다.</p>
          <div className="review-progress" role="status" aria-live="polite"><strong>{checkedCount}/{ALL_ITEMS.length}</strong> 항목을 확인했습니다.</div>
          <div className="review-actions"><button className="review-button review-button--primary" type="button" onClick={markAll}>전체 체크</button><button className="review-button review-button--secondary" type="button" onClick={clearAll}>전체 해제</button></div>
        </header>
        <ChecklistGroup title="9개 화면" items={SCREEN_ITEMS} checked={checked} onToggle={toggle} />
        <ChecklistGroup title="두 사용자 집단 성공 기준" items={SUCCESS_ITEMS} checked={checked} onToggle={toggle} />
        <ChecklistGroup title="외부 자격증명·약관 공백" items={EXTERNAL_GAP_ITEMS} checked={checked} onToggle={toggle} />
      </div>
    </main>
  );
}
