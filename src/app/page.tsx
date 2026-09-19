"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CuratedRouteCard } from "@/features/public/curated-route-card";
import {
  COMPANION_LABELS,
  INTEREST_LABELS,
  PUBLIC_CURATIONS,
  TRANSPORT_LABELS,
  type CompanionType,
  type InterestTag,
  type TransportMode,
} from "@/features/public/public-data";

type RouteDraft = Readonly<{
  startLocation: string;
  travelTime: string;
  companion: CompanionType | "";
  transport: TransportMode | "";
  interest: InterestTag | "";
}>;

type FormErrors = Partial<Record<keyof RouteDraft, string>>;

const INITIAL_DRAFT: RouteDraft = {
  startLocation: "",
  travelTime: "",
  companion: "",
  transport: "",
  interest: "",
};

function isCompanionType(value: string): value is CompanionType {
  return value === "family" || value === "couple" || value === "solo" || value === "friends";
}

function isTransportMode(value: string): value is TransportMode {
  return value === "walk" || value === "transit" || value === "car";
}

function isInterestTag(value: string): value is InterestTag {
  return value === "ceramics" || value === "nature" || value === "food" || value === "market" || value === "slow";
}

export default function Home() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<readonly string[]>([]);
  const [showNewRoute, setShowNewRoute] = useState(false);
  const [draft, setDraft] = useState<RouteDraft>(INITIAL_DRAFT);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generationStatus, setGenerationStatus] = useState<"idle" | "fallback">("idle");
  const [selectionMessage, setSelectionMessage] = useState("");

  function toggleCuration(curationId: string): void {
    setSelectionMessage("");
    setSelectedIds((current) => {
      if (current.includes(curationId)) {
        return current.filter((id) => id !== curationId);
      }
      if (current.length >= 3) {
        setSelectionMessage("동선은 최대 3개까지 선택할 수 있어요.");
        return current;
      }
      return [...current, curationId];
    });
  }

  function startSelectedPlans(): void {
    if (selectedIds.length === 0) {
      setSelectionMessage("먼저 비교할 동선을 한 개 이상 선택해 주세요.");
      return;
    }
    router.push(`/plan?curations=${selectedIds.join(",")}`);
  }

  function validateDraft(): FormErrors {
    const nextErrors: FormErrors = {};
    if (!draft.startLocation) nextErrors.startLocation = "출발 위치를 선택해 주세요.";
    if (!draft.travelTime) nextErrors.travelTime = "여행시간을 선택해 주세요.";
    if (!draft.companion) nextErrors.companion = "동행 유형을 선택해 주세요.";
    if (!draft.transport) nextErrors.transport = "이동수단을 선택해 주세요.";
    if (!draft.interest) nextErrors.interest = "관심사를 선택해 주세요.";
    return nextErrors;
  }

  function generateFallbackRoutes(): void {
    const nextErrors = validateDraft();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setGenerationStatus("idle");
      return;
    }
    setGenerationStatus("fallback");
    setSelectionMessage("조건에 맞춰 검증된 기본 동선 3개를 준비했어요.");
    setSelectedIds([]);
  }

  return (
    <main className="app-canvas home-page" id="main-content">
      <section className="page-shell home-page__shell">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">이천 여행의 새로운 출발점</p>
            <h1 className="display-title">
              이천의 하루를,
              <br />
              길부터 골라보세요.
            </h1>
            <p className="hero-lead">
              도자기의 길이 이어지는 이천에서 <span className="semantic-phrase">당신만의 여행 동선</span>을 준비합니다.
            </p>
            <div className="hero-status-row">
              <span className="primary-status">검증된 기본 동선 3개 준비 완료</span>
              <span className="story-note">마음에 드는 동선을 1~3개 골라 지도를 열어 보세요.</span>
            </div>
          </div>
          <div className="hero-artwork" aria-hidden="true">
            <div className="hero-artwork-ground" />
            <div className="ceramic-body" />
            <div className="ceramic-neck" />
            <div className="route-line" />
            <div className="route-labels">
              <span>도자예술마을</span>
              <span>설봉공원</span>
              <span>이천중앙시장</span>
            </div>
          </div>
        </div>

        <section className="curation-section" aria-labelledby="curation-heading">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">AI 큐레이션</p>
              <h2 className="section-title" id="curation-heading">오늘의 이천을 고르는 세 가지 길</h2>
            </div>
            <span className="section-count">3개 동선</span>
          </div>
          <p className="section-intro">모든 카드에는 확인일이 있는 공개 장소만 담았습니다. 먼저 1~3개를 비교해 보세요.</p>
          <div className="curation-grid">
            {PUBLIC_CURATIONS.map((curation) => (
              <CuratedRouteCard
                curation={curation}
                key={curation.id}
                selected={selectedIds.includes(curation.id)}
                onToggle={toggleCuration}
                actionHref={`/plan?curation=${curation.id}`}
              />
            ))}
          </div>
          <div className="selection-toolbar" aria-live="polite">
            <div>
              <strong>{selectedIds.length}개 동선 선택</strong>
              <span>선택한 동선마다 별도 계획으로 열립니다.</span>
              {selectionMessage ? <p className="form-feedback form-feedback--info">{selectionMessage}</p> : null}
            </div>
            <button className="button button--primary" type="button" onClick={startSelectedPlans}>
              선택한 동선 지도에서 열기
            </button>
          </div>
        </section>

        <section className="new-route-section" aria-labelledby="new-route-heading">
          <div className="new-route-section__header">
            <div>
              <p className="eyebrow">직접 고르기</p>
              <h2 className="section-title" id="new-route-heading">새 동선을 만들어 볼까요?</h2>
              <p className="section-intro">출발점과 여행 취향을 알려주면 검증된 장소로 후보 3개를 준비합니다.</p>
            </div>
            <button className="button button--outline" type="button" aria-expanded={showNewRoute} aria-controls="new-route-form" onClick={() => setShowNewRoute((current) => !current)}>
              {showNewRoute ? "조건 닫기" : "새 동선 만들기"}
            </button>
          </div>

          {showNewRoute ? (
            <div className="new-route-panel" id="new-route-form">
              <form className="route-form" onSubmit={(event) => { event.preventDefault(); generateFallbackRoutes(); }} noValidate>
                <div className={`form-field${errors.startLocation ? " form-field--error" : ""}`}>
                  <label htmlFor="start-location">출발 위치</label>
                  <select id="start-location" value={draft.startLocation} onChange={(event) => setDraft((current) => ({ ...current, startLocation: event.target.value }))}>
                    <option value="">출발점을 선택하세요</option>
                    <option value="icheon-station">이천역</option>
                    <option value="seolbong">설봉공원 주변</option>
                    <option value="yes-park">예스파크 주변</option>
                  </select>
                  {errors.startLocation ? <p className="field-error" role="alert">{errors.startLocation}</p> : null}
                </div>
                <div className={`form-field${errors.travelTime ? " form-field--error" : ""}`}>
                  <label htmlFor="travel-time">여행시간</label>
                  <select id="travel-time" value={draft.travelTime} onChange={(event) => setDraft((current) => ({ ...current, travelTime: event.target.value }))}>
                    <option value="">가능한 시간을 선택하세요</option>
                    <option value="180">반나절 · 3시간</option>
                    <option value="360">하루 · 6시간</option>
                    <option value="480">넉넉한 하루 · 8시간</option>
                  </select>
                  {errors.travelTime ? <p className="field-error" role="alert">{errors.travelTime}</p> : null}
                </div>
                <div className={`form-field${errors.companion ? " form-field--error" : ""}`}>
                  <label htmlFor="companion">동행 유형</label>
                  <select id="companion" value={draft.companion} onChange={(event) => { const value = event.target.value; setDraft((current) => ({ ...current, companion: isCompanionType(value) ? value : "" })); }}>
                    <option value="">누구와 가나요?</option>
                    {Object.entries(COMPANION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  {errors.companion ? <p className="field-error" role="alert">{errors.companion}</p> : null}
                </div>
                <div className={`form-field${errors.transport ? " form-field--error" : ""}`}>
                  <label htmlFor="route-transport">이동수단</label>
                  <select id="route-transport" value={draft.transport} onChange={(event) => { const value = event.target.value; setDraft((current) => ({ ...current, transport: isTransportMode(value) ? value : "" })); }}>
                    <option value="">이동수단을 선택하세요</option>
                    {Object.entries(TRANSPORT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  {errors.transport ? <p className="field-error" role="alert">{errors.transport}</p> : null}
                </div>
                <div className={`form-field${errors.interest ? " form-field--error" : ""}`}>
                  <label htmlFor="interest">관심사</label>
                  <select id="interest" value={draft.interest} onChange={(event) => { const value = event.target.value; setDraft((current) => ({ ...current, interest: isInterestTag(value) ? value : "" })); }}>
                    <option value="">가장 끌리는 테마를 선택하세요</option>
                    {Object.entries(INTEREST_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  {errors.interest ? <p className="field-error" role="alert">{errors.interest}</p> : null}
                </div>
                <button className="button button--primary route-form__submit" type="submit">후보 동선 3개 만들기</button>
              </form>
              {generationStatus === "fallback" ? (
                <div className="fallback-result" aria-live="polite">
                  <div className="status-banner status-banner--info">
                    <strong>검증된 기본 큐레이션으로 준비했어요.</strong>
                    <span>외부 추천 연결이 없어도 확인된 장소 3개를 바로 비교할 수 있습니다.</span>
                  </div>
                  <div className="curation-grid curation-grid--generated">
                    {PUBLIC_CURATIONS.map((curation) => <CuratedRouteCard curation={curation} key={`generated-${curation.id}`} selected={selectedIds.includes(curation.id)} onToggle={toggleCuration} />)}
                  </div>
                  <div className="selection-toolbar selection-toolbar--generated">
                    <span>{selectedIds.length}개 선택됨 · 각 계획은 별도로 열립니다.</span>
                    <button className="button button--primary" type="button" onClick={startSelectedPlans}>후보를 지도에서 열기</button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
        <p className="home-page__note">카드의 장소 정보는 확인일이 표시된 공개 데이터이며, 실제 운영 전에는 방문 전 다시 확인해 주세요.</p>
      </section>
    </main>
  );
}
