"use client";

import { useEffect } from "react";
import {
  CONSULAR_CALL_CENTER,
  SAFETY_DISCLAIMER,
  type CountrySafetyInfo,
} from "@/data/country-safety.schema";

/**
 * CMP-SCR001-SAFETY-GRID-DRAWER — 국가 안전정보 Drawer.
 *
 * Desktop은 우측 슬라이드(폭 480px), Mobile은 전체화면 Modal(DESIGN.md Drawer·
 * Modal 정의). 8개 카테고리(REQ-FUNC-047), 출처·확인일(048), 외교부 링크+
 * noopener,noreferrer(049), stale 배지(050, 렌더링 시점 계산), 중대 경보 상단
 * 텍스트 라벨(051), 국가/지역 범위(052), 긴급연락처(053), "공식 판단 대체 아님"
 * 고지(054)를 모두 포함한다.
 */

const STALE_THRESHOLD_DAYS = 7;

function isStale(verifiedAt: string): boolean {
  const verifiedMs = new Date(verifiedAt).getTime();
  if (Number.isNaN(verifiedMs)) return false;
  const elapsedDays = (Date.now() - verifiedMs) / (1000 * 60 * 60 * 24);
  return elapsedDays >= STALE_THRESHOLD_DAYS;
}

const ALERT_BADGE_CLASS: Record<CountrySafetyInfo["alertLevel"], string> = {
  안전: "bg-success text-on-primary",
  여행유의: "bg-info text-on-primary",
  여행자제: "bg-warning text-on-primary",
  출국권고: "bg-danger text-on-primary",
  여행금지: "bg-danger-strong text-on-primary",
};

export interface SafetyDrawerProps {
  info: CountrySafetyInfo | null;
  onClose: () => void;
}

export default function SafetyDrawer({ info, onClose }: SafetyDrawerProps) {
  useEffect(() => {
    if (!info) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [info, onClose]);

  if (!info) return null;

  const stale = isStale(info.source.verifiedAt);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${info.countryName} 안전정보`}
        className="absolute inset-0 overflow-y-auto bg-canvas md:inset-y-0 md:right-0 md:left-auto md:w-[480px] md:rounded-l-lg md:shadow-card"
      >
        <div className="flex items-center justify-between border-b border-hairline px-md py-sm">
          <h2 className="text-title-md text-text-primary">
            {info.countryName} 안전정보
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-9 w-9 items-center justify-center rounded-sm text-title-md text-text-primary"
          >
            ✕
          </button>
        </div>

        <div className="px-md py-lg">
          {/* REQ-FUNC-051: 중대 경보는 색상만이 아니라 텍스트 라벨과 함께 상단에 배치 */}
          <div
            className={`flex items-center gap-xs rounded-sm px-md py-sm text-body-sm ${ALERT_BADGE_CLASS[info.alertLevel]}`}
          >
            <span className="text-badge">{info.alertLevel}</span>
            <span>{info.alertLabel}</span>
          </div>

          {/* REQ-FUNC-052: 국가 전역/특정 지역 범위 구분 */}
          <p className="mt-xs text-body-sm text-text-secondary">
            적용 범위: {info.scopeType === "COUNTRY" ? "국가 전역" : "지역"} ·{" "}
            {info.scopeText}
          </p>

          {/* REQ-FUNC-050: stale(7일 초과) 배지는 렌더링 시점에 계산 */}
          <p className="mt-xs text-caption text-text-muted">
            최종 확인일: {info.source.verifiedAt}
            {stale ? (
              <span className="ml-xs rounded-pill bg-warning px-xs py-0 text-badge text-on-primary">
                확인일 7일 경과 — 재확인 필요
              </span>
            ) : null}
          </p>

          {/* REQ-FUNC-047: 8개 필수 카테고리 */}
          <dl className="mt-lg space-y-md">
            {info.categories.map((entry) => (
              <div key={entry.category}>
                <dt className="text-title-sm text-text-primary">
                  {entry.category}
                </dt>
                <dd className="mt-xxs text-body-sm text-text-secondary">
                  {entry.summary}
                </dd>
              </div>
            ))}
          </dl>

          {/* REQ-FUNC-053: 현지 긴급전화 + 영사콜센터 */}
          <div className="mt-lg rounded-md bg-surface-soft px-md py-sm">
            <p className="text-title-sm text-text-primary">긴급연락처</p>
            <p className="mt-xxs text-body-sm text-text-secondary">
              현지 긴급전화: {info.emergencyContacts.localEmergencyNumber}
            </p>
            <p className="mt-xxs text-body-sm text-text-secondary">
              대사관/영사관: {info.emergencyContacts.embassyPhone}
            </p>
            <p className="mt-xxs text-body-sm text-text-secondary">
              {CONSULAR_CALL_CENTER.label}: {CONSULAR_CALL_CENTER.phone}
            </p>
          </div>

          {/* REQ-FUNC-048, 049: 출처·확인일·편집자 + 외교부 원문 링크(새 탭) */}
          <p className="mt-lg text-body-sm text-text-secondary">
            출처: {info.source.name} · 편집자: {info.source.editor}
          </p>
          <a
            href={info.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-xs inline-block text-body-sm text-primary underline underline-offset-2"
          >
            외교부 해외안전여행 원문 보기
          </a>

          {/* REQ-FUNC-054: 공식 판단 대체 아님 고지 */}
          <p className="mt-lg text-caption text-text-muted">
            {SAFETY_DISCLAIMER}
          </p>
        </div>
      </div>
    </div>
  );
}
