"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LoadingState } from "@/components/LoadingState";
import { PassGradePanel } from "@/components/PassGradePanel";
import { PassLengthMix } from "@/components/PassLengthMix";
import { PassScoreSections } from "@/components/PassScoreSections";
import { ProfileClusterCard } from "@/components/ProfileClusterCard";
import { XpIndicesPanel } from "@/components/XpIndicesPanel";
import { XpProfilePanel } from "@/components/XpProfilePanel";
import type { PeerScope, PlayerProfile } from "@/lib/api";
import { formatContractUntil } from "@/lib/formatters";
import {
  getCachedPlayerProfile,
  loadPlayerProfile,
} from "@/lib/profileClientCache";
import { overallPassGradeFromProfile } from "@/lib/passGrades";
import { selectProfileView } from "@/lib/profileView";
import { useI18n } from "@/lib/i18n/context";

function FactIcon({ icon }: { icon: string }) {
  return (
    <span className="identity-fact-icon" aria-hidden="true">
      <i className={`fa-solid ${icon}`} />
    </span>
  );
}

export function ProfileView({
  playerId,
  positionFamily = "midfielders",
  peerScope = "league",
}: {
  playerId: string;
  positionFamily?: string;
  peerScope?: PeerScope;
}) {
  const { m } = useI18n();
  const [data, setData] = useState<PlayerProfile | null>(
    () => getCachedPlayerProfile(playerId, positionFamily),
  );
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(() => !data);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cached = getCachedPlayerProfile(playerId, positionFamily);
    if (cached) {
      setData(cached);
      setInitialLoading(false);
    } else {
      setInitialLoading(true);
    }
    setError(null);
    setRefreshing(true);

    loadPlayerProfile(playerId, positionFamily)
      .then((profile) => {
        if (!cancelled) setData(profile);
      })
      .catch((e) => {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : m.common.loadFailed;
        setError(
          msg === "Failed to fetch" ? m.profile.backendError : msg,
        );
      })
      .finally(() => {
        if (!cancelled) {
          setInitialLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [playerId, positionFamily, m.profile.backendError, m.common.loadFailed]);

  if (initialLoading && !data) {
    return <LoadingState message={m.profile.loadingPlayer} />;
  }
  if (error && !data) return <div className="error-box">{error}</div>;
  if (!data) return null;

  const p = data.player;
  const activeView = selectProfileView(data, "absolute", peerScope);
  const passScores = activeView.pass_scores;
  const overallPassGrade = overallPassGradeFromProfile(data);

  return (
    <>
      <div className={`profile-view-shell${refreshing ? " is-refreshing" : ""}`}>
        <div className="pa-layout">
          <div className="pa-col pa-col-identity">
            <div className="player-card profile-identity-head-card">
              <div className="profile-identity-head-grid">
                <div className="identity-photo-side profile-identity-photo">
                  {p.photo_url ? (
                    <Image
                      src={String(p.photo_url)}
                      alt=""
                      fill
                      className="identity-photo"
                      unoptimized
                      priority
                      sizes="180px"
                    />
                  ) : (
                    <div className="identity-photo-placeholder identity-photo-placeholder-side">
                      {String(p.player_name ?? "?").charAt(0)}
                    </div>
                  )}
                </div>

                <div className="profile-identity-head-copy">
                  <h2 className="identity-title">{String(p.player_name ?? "—")}</h2>
                  <p className="identity-subline">
                    {String(p.team ?? "—")} · {String(p.position ?? "—")}
                  </p>
                  {data.profile_cluster ? (
                    <ProfileClusterCard cluster={data.profile_cluster} compact />
                  ) : null}
                </div>
              </div>
            </div>

            <div className="identity-card identity-card-bare">
              <div className="identity-facts identity-facts-side">
                <div className="identity-fact">
                  <FactIcon icon="fa-cake-candles" />
                  <span className="identity-fact-label">{m.common.age}</span>
                  <span className="identity-fact-value tabular">{p.age != null ? String(p.age) : "—"}</span>
                </div>
                <div className="identity-fact">
                  <FactIcon icon="fa-ruler-vertical" />
                  <span className="identity-fact-label">{m.common.height}</span>
                  <span className="identity-fact-value">{String(p.height ?? "—")}</span>
                </div>
                <div className="identity-fact">
                  <FactIcon icon="fa-earth-americas" />
                  <span className="identity-fact-label">{m.common.nationality}</span>
                  <span className="identity-fact-value">{String(p.nationality ?? "—")}</span>
                </div>
                <div className="identity-fact">
                  <FactIcon icon="fa-shoe-prints" />
                  <span className="identity-fact-label">{m.common.foot}</span>
                  <span className="identity-fact-value">{String(p.dominant_foot ?? "—")}</span>
                </div>
              </div>

              <div className="identity-meta-row">
                <div className="identity-meta-pill">
                  <span><FactIcon icon="fa-coins" /> {m.common.value}</span>
                  <strong>{String(p.market_value ?? "—")}</strong>
                </div>
                <div className="identity-meta-pill">
                  <span><FactIcon icon="fa-calendar-days" /> {m.common.contract}</span>
                  <strong>{formatContractUntil(p.contract_until)}</strong>
                </div>
                <div className="identity-meta-pill">
                  <span><FactIcon icon="fa-clock" /> {m.common.minutes}</span>
                  <strong className="tabular">{p.minutes != null ? String(p.minutes) : "—"}</strong>
                </div>
              </div>

              {data.origin_heatmap_b64 && (
                <img src={`data:image/png;base64,${data.origin_heatmap_b64}`} alt={m.profile.passOriginAlt} className="heatmap-img" />
              )}
            </div>
          </div>

          <div className="pa-col pa-col-score">
            <div className="score-stack">
              <div className="player-card profile-grade-card">
                <PassGradePanel score={overallPassGrade} embedded />
              </div>
              <XpProfilePanel xp={data.xp ?? {}} peerScope={peerScope} />
              <div className="player-card profile-indices-mix-card">
                <XpIndicesPanel
                  indices={data.xp_indices ?? []}
                  roundGrades={data.xp_round_grades ?? []}
                  gameGradeMad={
                    typeof data.xp?.xp_game_grade_mad === "number"
                      ? data.xp.xp_game_grade_mad
                      : null
                  }
                />
                <PassLengthMix data={data} />
              </div>
            </div>
          </div>

          <div className="pa-col pa-col-pillars">
            <div className="player-card pillars-card">
              <h3 className="section-label">{m.sections.passScores}</h3>
              <PassScoreSections sections={passScores} />
            </div>
          </div>
        </div>
      </div>

      <div className="profile-actions">
        <Link href={`/compare?a=${playerId}`} className="btn btn-primary">
          <i className="fa-solid fa-scale-balanced" /> {m.common.compare}
        </Link>
        <Link href={`/maps?player=${playerId}`} className="btn btn-ghost">
          <i className="fa-solid fa-map-location-dot" /> {m.common.viewMaps}
        </Link>
      </div>
    </>
  );
}
