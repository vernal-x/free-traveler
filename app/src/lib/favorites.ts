import { useMemo, useSyncExternalStore } from "react";

/**
 * SA-FAVORITES-LOCALSTORAGE — 여행지 즐겨찾기.
 *
 * REQ-FUNC-068: `localStorage`에만 저장하고 서버로 절대 전송하지 않는다(Supabase
 * 쓰기 없음). 즐겨찾기 여부는 `destinations.ts`의 `Destination.id`를 키로 사용한다.
 * `useFavorites()`는 `useSyncExternalStore`로 다른 컴포넌트·다른 탭(storage 이벤트)의
 * 변경에도 즉시 리렌더링되도록 한다.
 */

const STORAGE_KEY = "freetraveler:favorites";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage 접근 불가(프라이빗 브라우징, 용량 초과 등) — 조용히 무시한다.
  }
  notify();
}

const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

function getSnapshot(): string {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function getServerSnapshot(): string {
  return "[]";
}

export function getFavorites(): string[] {
  return readIds();
}

export function isFavorite(id: string): boolean {
  return readIds().includes(id);
}

/** 이미 즐겨찾기된 id는 다시 추가하지 않는다(중복 방지, TC-1). */
export function addFavorite(id: string): void {
  const current = readIds();
  if (current.includes(id)) return;
  writeIds([...current, id]);
}

export function removeFavorite(id: string): void {
  writeIds(readIds().filter((existing) => existing !== id));
}

/** 반환값은 토글 후의 즐겨찾기 여부(추가되면 true, 제거되면 false). */
export function toggleFavorite(id: string): boolean {
  const current = readIds();
  const nextIsFavorite = !current.includes(id);
  writeIds(
    nextIsFavorite
      ? [...current, id]
      : current.filter((existing) => existing !== id),
  );
  return nextIsFavorite;
}

export function useFavorites(): {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => boolean;
} {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const favorites = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(snapshot);
      return Array.isArray(parsed)
        ? parsed.filter((v): v is string => typeof v === "string")
        : [];
    } catch {
      return [];
    }
  }, [snapshot]);

  return {
    favorites,
    isFavorite: (id: string) => favorites.includes(id),
    toggleFavorite,
  };
}
