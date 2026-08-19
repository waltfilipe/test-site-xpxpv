export type Locale = "en" | "pt";

export type Messages = {
  nav: {
    home: string;
    reports: string;
    profile: string;
    compare: string;
    maps: string;
    players: string;
  };
  lang: {
    switchToPt: string;
    switchToEn: string;
  };
  brand: {
    name: string;
    nameMain: string;
    nameAccent: string;
  };
  common: {
    loading: string;
    search: string;
    player: string;
    players: string;
    athletes: string;
    age: string;
    height: string;
    nationality: string;
    foot: string;
    value: string;
    contract: string;
    minutes: string;
    years: string;
    minutesPct: string;
    backToProfile: string;
    fullProfile: string;
    viewMaps: string;
    compare: string;
    compareMaps: string;
    exportPdf: string;
    exportGroup: string;
    unavailable: string;
    loadFailed: string;
    noResults: string;
    filter: string;
    filtering: string;
    clear: string;
    allLeagues: string;
    allPositions: string;
    game: string;
    match: string;
    close: string;
    playerA: string;
    playerB: string;
    selectedGroup: string;
    reports: string;
    groups: string;
    exportable: string;
  };
  home: {
    eyebrow: string;
    lead: string;
    playersStat: string;
    leaguesStat: string;
    modelStat: string;
    modulesAria: string;
    footnote: string;
    insightsAria: string;
    insightsTitle: string;
    insightsLead: string;
    insights: {
      xp: { tag: string; title: string; body: string };
      xpv: { tag: string; title: string; body: string };
      grades: { tag: string; title: string; body: string };
      analyzed: { tag: string; title: string; body: string };
      mission: { tag: string; title: string; body: string };
    };
    modules: {
      reports: { title: string; description: string };
      profile: { title: string; description: string };
      compare: { title: string; description: string };
      maps: { title: string; description: string };
      players: { title: string; description: string };
    };
  };
  profile: {
    pageSubtitle: string;
    pageLead: string;
    loadingPool: string;
    loadingProfile: string;
    loadingPlayer: string;
    noPlayersInGroup: string;
    searchPlayer: string;
    searchPlaceholder: string;
    selectPlayer: string;
    namePlaceholder: string;
    backendError: string;
    backendRetryNote: string;
    passOriginAlt: string;
    leagueFilter: {
      eyebrow: string;
      ariaLabel: string;
    };
    modeToggleLabel: string;
    modeAbsolute: string;
    modeRelative: string;
    rankOf: string;
    rankTopPct: string;
    xpvPerGame: string;
    prodRelVolume: string;
    coePerPass: string;
    coeShortPass: string;
    coeLongPass: string;
    clusterTip: string;
  };
  players: {
    subtitle: string;
    loadingFilters: string;
    found: string;
    foundPlural: string;
    viewReports: string;
    loadFailed: string;
    searchPlaceholder: string;
    league: string;
    passRating: string;
    volume: string;
    efficiency: string;
    buildup: string;
    chanceCreation: string;
    defense: string;
    reportsPromoTitle: string;
    reportsPromoDesc: string;
    reportsPromoCta: string;
  };
  passGrade: {
    title: string;
    unavailable: string;
    overallTitle: string;
    overallTip: string;
    general: string;
    expected: string;
    generalTip: string;
    expectedTip: string;
    tiers: {
      elite: string;
      veryGood: string;
      good: string;
      average: string;
      belowAverage: string;
    };
  };
  productivity: {
    title: string;
    general: string;
    relative: string;
    expected: string;
    generalTip: string;
    relativeTip: string;
    expectedTip: string;
  };
  precision: {
    title: string;
    coeTip: string;
    general: string;
    expected: string;
    generalCoe: string;
    stratumCoe: string;
    generalCoeTip: string;
    stratumCoeTip: string;
  };
  lethality: {
    title: string;
    xpvPerPass: string;
    impactRate: string;
    xpvPerPassTip: string;
    impactRateTip: string;
  };
  passLengthMix: {
    title: string;
    short: string;
    long: string;
    leagueRefTitle: string;
    playerLongTitle: string;
    shortLegend: string;
    longLegend: string;
  };
  compare: {
    subtitle: string;
    pageLead: string;
    loading: string;
    backendUnavailable: string;
    pickerPlaceholder: string;
    mapLoadFailed: string;
    metric: string;
    radarAria: string;
    passOriginAlt: string;
  };
  maps: {
    subtitle: string;
    generating: string;
    backendUnavailable: string;
    aggregateNote: string;
    noScatterData: string;
    scatterCaption: string;
    scatterView: string;
    passMapView: string;
    passMapAlt: string;
    destMapAlt: string;
    commonPassesAlt: string;
    rarePassesAlt: string;
  };
  mapFilters: {
    progressive: string;
    test_impact_v2: string;
    line_break: string;
    key_passes: string;
    long_passes: string;
    report_progressive_origin: string;
    report_progressive_dest: string;
    report_impact_final_third: string;
    report_impact_passes: string;
  };
  reports: {
    heroTitle: string;
    heroSubtitle: string;
    heroLead: string;
    scoutingEyebrow: string;
    preparingMaps: string;
    loadingBatches: string;
    loadingFirst: string;
    loadingPlayer: string;
    loadingPlayerId: string;
    loadPlayerFailed: string;
    loadPlayerFailedPrefix: string;
    pageFootnote: string;
    exportPdfTitle: string;
    generatingMaps: string;
    loadingMaps: string;
    readyStat: string;
    inGroupStat: string;
    mapsLoadHint: string;
    overview: string;
    passMapsEyebrow: string;
    mapsPageLabel: string;
    midfielderReportLabel: string;
    midfielderReportEyebrow: string;
    backToProfile: string;
    viewMaps: string;
    progressivePassesBlock: string;
    reportMapOrigin: string;
    reportMapDestination: string;
    reportImpactPassesTitle: string;
    progressiveLinkPasses: string;
    minutesShort: string;
    ageYears: string;
    categories: {
      all: { title: string; description: string };
      u23: { title: string; description: string };
      mid: { title: string; description: string };
      over30: { title: string; description: string };
    };
  };
  sections: {
    xpProfile: string;
    passScores: string;
    badges: string;
    xpIndices: string;
    xpPillars: string;
    passProfile: string;
    passProfileCluster: string;
  };
  badges: {
    organizer: string;
    organizerTooltip: string;
    prodRelLift: string;
    prodRelLiftTooltip: string;
    precStratumLift: string;
    precStratumLiftTooltip: string;
  };
  roundStats: {
    grade: string;
    passes: string;
    xpv: string;
    xpPerPass: string;
    breakline: string;
    impact: string;
    keyPasses: string;
    chartAria: string;
  };
  stratumStar: string;
  tooltips: {
    xpProfileBars: Record<string, string>;
    passScores: Record<string, string>;
    components: Record<string, string>;
    componentLabels: Record<string, string>;
    index: Record<string, string>;
    passGrade: string;
    passLength: string;
    impactExtra: Record<string, string>;
  };
  filters: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    clearFilters: string;
    age: string;
    height: string;
    nationality: string;
    subgroup: string;
    league: string;
    dominantFoot: string;
    ageBand: string;
    passGrades: string;
    regionCountries: string;
  };
  positionFamilies: {
    midfielders: string;
    allMidfielders: string;
    centralMidfielders: string;
    attackingMidfielders: string;
  };
  gradeFilters: {
    all: string;
  };
  footOptions: {
    all: string;
    left: string;
    right: string;
    both: string;
  };
  ageBands: {
    all: string;
    u21: string;
    u23: string;
    mid: string;
    over30: string;
  };
  profileCategories: Record<
    string,
    { title: string; subtitle: string; description: string }
  >;
  groupLabels: {
    top10: string;
    extendedWatchlist: string;
  };
};

const en: Messages = {
  nav: {
    home: "Home",
    reports: "Reports",
    profile: "Profile",
    compare: "Compare",
    maps: "Maps",
    players: "Players",
  },
  lang: {
    switchToPt: "Português",
    switchToEn: "English",
  },
  brand: {
    name: "xP & xPV Analysis",
    nameMain: "xP & xPV ",
    nameAccent: "Analysis",
  },
  common: {
    loading: "Loading…",
    search: "Search",
    player: "Player",
    players: "Players",
    athletes: "players",
    age: "Age",
    height: "Height",
    nationality: "Nationality",
    foot: "Foot",
    value: "Value",
    contract: "Contract",
    minutes: "Minutes",
    years: "yrs",
    minutesPct: "% of possible minutes",
    backToProfile: "Back to profile",
    fullProfile: "Full profile",
    viewMaps: "View maps",
    compare: "Compare",
    compareMaps: "Compare maps",
    exportPdf: "Export PDF",
    exportGroup: "Export group",
    unavailable: "Unavailable",
    loadFailed: "Failed to load",
    noResults: "No players found.",
    filter: "Filter",
    filtering: "Filtering…",
    clear: "Clear",
    allLeagues: "All leagues",
    allPositions: "All positions",
    game: "Match",
    match: "Match",
    close: "Close",
    playerA: "Player A",
    playerB: "Player B",
    selectedGroup: "Selected group",
    reports: "reports",
    groups: "groups",
    exportable: "exportable",
  },
  home: {
    eyebrow: "European pass analytics",
    lead:
      "Pass Analysis of Top Midfielders from Non-Champions League Teams Across Europe's Top Five Leagues.",
    playersStat: "players",
    leaguesStat: "leagues",
    modelStat: "M4 model",
    modulesAria: "xP & xPV Analysis modules",
    footnote: "",
    insightsAria: "How xP and xPV work",
    insightsTitle: "Understanding the model",
    insightsLead:
      "A quick guide to the metrics behind the reports — written for scouts and analysts, not statisticians.",
    insights: {
      xpv: {
        tag: "xPV",
        title: "How valuable is the destination?",
        body:
          "xPV measures how much it’s worth arriving at a point on the pitch. It doesn’t ask whether the pass will arrive — it asks whether the destination is good: does it advance play, is it a rare or strategic spot, and is it reachable in that situation. Only completed passes count.",
      },
      xp: {
        tag: "xP",
        title: "How hard was the pass?",
        body:
          "xP measures how difficult it was to complete a pass — the “xG of passing”. Given where the player is, where they’re aiming, the distance and angle, how likely was the ball to arrive? Both completed and missed passes count.",
      },
      grades: {
        tag: "Grades",
        title: "Easy to read at a glance",
        body:
          "Pass Grades turn the model into a single score from 1 to 10, compared to peers in the same position pool. An 8+ signals elite passing among European midfielders — not just within one league.",
      },
      analyzed: {
        tag: "Scope",
        title: "What we study",
        body:
          "Pass maps, volume, consistency, progression into the final third, chance creation and defensive work. Together they show how a player builds play, when they take risks, and where they hurt opponents.",
      },
      mission: {
        tag: "Reports",
        title: "Why this project exists",
        body:
          "To identify midfielders with outstanding passing ability under these new metrics — athletes who can orchestrate play and create value through distribution, before the market fully catches on.",
      },
    },
    modules: {
      reports: {
        title: "Reports",
        description: "PDF-ready reports for 45 midfielders — xP grades, pass scores and maps by age group.",
      },
      profile: {
        title: "Profile",
        description: "Full player profile — pass radar, xP indices and origin heatmaps.",
      },
      compare: {
        title: "Compare",
        description: "Side-by-side comparison of two players in the same position pool.",
      },
      maps: {
        title: "Maps",
        description: "Pass maps and metric scatter — progressive, impact, line break and more.",
      },
      players: {
        title: "Players",
        description: "Full pool list with ratings, filters and metric sorting.",
      },
    },
  },
  profile: {
    pageSubtitle: "Full analysis with pass scores, xP indices and rankings against the full European pool.",
    pageLead:
      "Full position analysis — xP, pass scores, indices and origin maps. Rankings within the selected pool.",
    loadingPool: "Loading player pool…",
    loadingProfile: "Loading profile…",
    loadingPlayer: "Loading player profile…",
    noPlayersInGroup: "No players found in this group.",
    searchPlayer: "Search player",
    searchPlaceholder: "Player name…",
    selectPlayer: "Player",
    namePlaceholder: "Player name…",
    backendError: "Could not connect to the API. Please try again shortly.",
    backendRetryNote:
      "The backend may take a few minutes on first load — please try again shortly.",
    passOriginAlt: "Pass origin heatmap",
    leagueFilter: {
      eyebrow: "League filter",
      ariaLabel: "Filter players by league",
    },
    modeToggleLabel: "Profile number mode",
    modeAbsolute: "Absolute",
    modeRelative: "Relative",
    rankOf: "of",
    rankTopPct: "Top {pct}%",
    xpvPerGame: "xPV/Game",
    prodRelVolume: "Volume rate (relative)",
    coePerPass: "COE/Pass",
    coeShortPass: "COE/Short Pass",
    coeLongPass: "COE/Long Pass",
    clusterTip: "K=4 pass-profile cluster on raw absolute metrics. About {pct}% of the eligible pool shares this archetype.",
  },
  players: {
    subtitle: "Top-five European league players with pass ratings and position-pool pillars.",
    loadingFilters: "Loading filters…",
    found: "player found",
    foundPlural: "players found",
    viewReports: "View reports",
    loadFailed: "Failed to load players",
    searchPlaceholder: "Search player…",
    league: "League",
    passRating: "Pass Rating",
    volume: "Volume",
    efficiency: "Efficiency",
    buildup: "Build-up",
    chanceCreation: "Chance creation",
    defense: "Defense",
    reportsPromoTitle: "Reports",
    reportsPromoDesc: "PDF-ready reports — U23 Breakout, Prime Prospects 24–30 and Experience 30+",
    reportsPromoCta: "View reports",
  },
  compare: {
    subtitle: "Compare two midfielders on xP pillars, pass scores and origin heatmaps.",
    pageLead:
      "Compare two midfielders from the European pool. Metrics and grades are relative to position peers.",
    loading: "Loading comparison…",
    backendUnavailable: "API unavailable — try again shortly.",
    pickerPlaceholder: "Type player name…",
    mapLoadFailed: "Failed to load map",
    metric: "Metric",
    radarAria: "Pass profile radar comparison",
    passOriginAlt: "Pass origin heatmap",
  },
  maps: {
    subtitle: "Pass maps for the curated midfielder pool.",
    generating: "Generating maps…",
    backendUnavailable: "API unavailable — try again shortly.",
    aggregateNote: "Aggregate view · top 250 by volume",
    noScatterData: "No data for scatter.",
    scatterCaption: "players · gold lines = mean",
    scatterView: "Scatter",
    passMapView: "Pass map",
    passMapAlt: "Pass map",
    destMapAlt: "Destination heatmap",
    commonPassesAlt: "Common passes",
    rarePassesAlt: "Rare passes",
  },
  mapFilters: {
    progressive: "Progressive Passes",
    test_impact_v2: "Impact Passes",
    line_break: "Breakline passes",
    key_passes: "Key Passes",
    long_passes: "Long Passes",
    report_progressive_origin: "Progressive Pass · Origin",
    report_progressive_dest: "Progressive Pass · Destination",
    report_impact_final_third: "Impact Passes · Final Third",
    report_impact_passes: "Impact Passes",
  },
  reports: {
    heroTitle: "Midfielder reports",
    heroSubtitle: "Curated pool with full-pool rankings — export PDF by age group.",
    heroLead:
      "{count} curated profiles across 3 age bands — xP overview, pass scores, consistency and pass maps. PDF export by group.",
    scoutingEyebrow: "Scouting intelligence",
    preparingMaps: "Preparing maps…",
    loadingBatches: "Loading reports in batches…",
    loadingFirst: "Loading first reports…",
    loadingPlayer: "Loading player…",
    loadingPlayerId: "Loading {id}…",
    loadPlayerFailed: "Failed to load player",
    loadPlayerFailedPrefix: "Failed to load player",
    pageFootnote: "players · midfielder pool · 5 European leagues",
    exportPdfTitle: "Export PDF for",
    generatingMaps: "Generating player maps…",
    loadingMaps: "Loading maps…",
    readyStat: "ready",
    inGroupStat: "in group",
    mapsLoadHint: "maps load on PDF export",
    overview: "Overview",
    passMapsEyebrow: "Pass Maps",
    mapsPageLabel: "Maps",
    midfielderReportLabel: "Midfielder Report",
    midfielderReportEyebrow: "Midfielder Report",
    backToProfile: "Back to profile",
    viewMaps: "View maps",
    progressivePassesBlock: "Progressive Passes (Origin & Destination)",
    reportMapOrigin: "Origin",
    reportMapDestination: "Destination",
    reportImpactPassesTitle: "Impact Passes",
    progressiveLinkPasses: "{count} passes",
    minutesShort: "Min",
    ageYears: "{age} yrs",
    categories: {
      all: {
        title: "All players",
        description: "Full curated pool of 45 midfielders.",
      },
      u23: {
        title: "U23",
        description: "Under-23 breakout profiles.",
      },
      mid: {
        title: "24–30",
        description: "Prime-age midfielders.",
      },
      over30: {
        title: "30+",
        description: "Experienced profiles.",
      },
    },
  },
  sections: {
    xpProfile: "xP Profile",
    passScores: "Pass Scores",
    badges: "Badges",
    xpIndices: "xP Indices",
    xpPillars: "xP Pillars",
    passProfile: "Pass Profile",
    passProfileCluster: "Pass profile type",
  },
  badges: {
    organizer: "Organizer",
    organizerTooltip:
      "High xPV/Pass and pass volume with below-median Impact Rate and strong short-pass COE vs the midfielder pool.",
    prodRelLift: "Team share lift",
    prodRelLiftTooltip:
      "Relative productivity exceeds General by {gap} pts — above P70 in the eligible midfielder pool (threshold {p70}; pool mean gap {mean}).",
    precStratumLift: "Volume stratum lift",
    precStratumLiftTooltip:
      "COE in volume stratum exceeds General COE by {gap} pts — above P70 in the eligible pool (threshold {p70}; pool mean gap {mean}).",
  },
  roundStats: {
    grade: "Grade",
    passes: "Passes",
    xpv: "xPV",
    xpPerPass: "xP",
    breakline: "Breakline passes",
    impact: "Impact passes",
    keyPasses: "Key passes",
    chartAria: "Grades by match",
  },
  stratumStar: "Top quartile vs pass-volume peers",
  passGrade: {
    title: "Pass Grade",
    unavailable: "Grade unavailable",
    overallTitle: "Overall Grade",
    overallTip: "Weighted pass grade: 40% productivity, 40% precision, 20% lethality (Sofascore-style grades within your league).",
    general: "General",
    expected: "Expected",
    generalTip:
      "Average of General Productivity and General Precision grades (league-rank Sofascore scale).",
    expectedTip:
      "Average of Expected Productivity and Expected Precision (COE stratum) grades.",
    tiers: {
      elite: "Elite",
      veryGood: "Very good",
      good: "Good",
      average: "Average",
      belowAverage: "Below average",
    },
  },
  productivity: {
    title: "Productivity",
    general: "General",
    relative: "Relative",
    expected: "Expected",
    generalTip:
      "Sofascore-style grade from xPV per game rank within your league (top midfielder = best grade).",
    relativeTip:
      "xPV/game vs hybrid expected ({gap} vs expected; actual {actual}, expected {expected}). Scaled 0–100 within your league.",
    expectedTip:
      "Sofascore-style grade from hybrid residual xPV rank within your league ({gap} residual; actual {actual}, expected {expected}).",
  },
  precision: {
    title: "Precision",
    general: "General",
    expected: "Expected",
    coeTip:
      "COE per pass ({coe} pp; actual {actual}%, expected {expected}%). League-rank Sofascore grade.",
    generalCoe: "General COE (all passes)",
    stratumCoe: "COE in volume stratum",
    generalCoeTip:
      "Sofascore-style grade from COE per pass rank within your league.",
    stratumCoeTip:
      "Sofascore-style grade from total-pass COE vs peers in the same pass-volume quartile within your league.",
  },
  lethality: {
    title: "Lethality",
    xpvPerPass: "xPV / pass",
    impactRate: "Impact rate",
    xpvPerPassTip:
      "Destination value per completed pass ({value}). Scaled 0–100 within your league — top midfielder in the league = 100.",
    impactRateTip:
      "Share of passes classified as impact passes ({value}%). Scaled 0–100 within your league — top in the league = 100.",
  },
  passLengthMix: {
    title: "Pass Length Mix",
    short: "Short",
    long: "Long",
    leagueRefTitle: "League reference: {pct}% long",
    playerLongTitle: "Player: {pct}% long",
    shortLegend: "{pct}% short",
    longLegend: "{pct}% long",
  },
  tooltips: {
    xpProfileBars: {
      xp_activity_display: "How much value they generate per game.",
      xp_efficiency_display:
        "Passing precision: COE per pass and COE stratum grades within your league.",
    },
    passScores: {
      Volume: "How much they pass.",
      Efficiency: "How cleanly they complete passes.",
      Lethality: "Threat per pass: destination value and impact-pass rate.",
      "Build-up": "Progression and line-breaking.",
      "Chance creation": "Passes that threaten the goal.",
      Impact: "xPV/Pass and Impact Rate combined.",
      "Defensive Contribution": "Defensive volume and duel quality.",
    },
    components: {
      passes_total: "Passing rhythm.",
      long_balls: "Long distribution.",
      xpass_coe_pct: "Short-pass edge vs expected.",
      xpass_total_coe_pct: "Overall completion edge.",
      xpass_long_coe_pct: "Long-pass edge vs expected.",
      progressive_passes: "Forward progression.",
      final_third_passes: "Entries into the final third.",
      key_passes: "Shot-assisting passes.",
      passes_to_box: "Passes into the box.",
      special_line_break_p90: "Line-breaking threat.",
      test_impact_v2_start_final_third_p90: "Danger from the final third.",
      defensive_actions_p90: "Tackles, interceptions and clearances.",
      chance_creation_xpv: "Quality of chance-creating passes.",
      threat_pass_pct: "Impact passes as a share of all passes.",
      def_won_tackle_p90: "Tackles won.",
      def_interception_p90: "Interceptions.",
      def_clearance_p90: "Clearances.",
      def_recovery_p90: "Ball recoveries.",
      def_aerial_won_p90: "Aerial duels won.",
      def_block_p90: "Blocks.",
      def_tackle_won_pct: "Tackle success rate.",
      def_aerial_won_pct: "Aerial success rate.",
      xpv_per_pass: "Average destination value per pass.",
      xp_residual_mean: "How much they beat the expected model.",
      vol_passes_team_share_pct: "Share of team passes per game.",
      vol_long_team_share_pct: "Share of team long passes per game.",
      eff_short_stratum_delta_pp: "Short COE above volume-stratum peers.",
      eff_long_stratum_delta_pp: "Long COE above volume-stratum peers.",
      build_prog_share_pct: "Progressive passes as a share of all passes.",
      build_final_third_share_pct: "Final-third entries as a share of passes.",
      build_line_break_share_pct: "Line breaks as a share of passes.",
      chance_key_share_pct: "Key passes as a share of all passes.",
      chance_box_share_pct: "Into-box passes as a share of all passes.",
      chance_impact_ft_share_pct: "Final-third impact passes as a share of passes.",
      chance_xpv_share_pct: "Chance-creation xPV as a share of total xP per game.",
      chance_creation_xpv_per_pass:
        "Creation xPV per creation pass (key + into box + final-third impact).",
      chance_creation_xpv_per_game: "Chance-creation xPV per game.",
      prod_rel_xpv: "xPV residual vs expected for pass volume.",
      prec_z_coe_stratum: "COE stratum z-score within volume band.",
    },
    componentLabels: {
      passes_total: "Passes / game",
      long_balls: "Long passes / game",
      xpass_coe_pct: "%Eff - Short Pass",
      xpass_long_coe_pct: "%Eff - Long Pass",
      progressive_passes: "Progressive passes / game",
      final_third_passes: "Final third entries / game",
      key_passes: "Key passes / game",
      passes_to_box: "Into box / game",
      special_line_break_p90: "Line breaks / game",
      test_impact_v2_start_final_third_p90: "I.P. on Final Third / game",
      defensive_actions_p90: "Defensive actions / 90",
      chance_creation_xpv: "Creation value",
      chance_creation_xpv_per_game: "Creation value / game",
      threat_pass_pct: "Impact rate",
      vol_passes_team_share_pct: "Passes vs team",
      vol_long_team_share_pct: "Long passes vs team",
      eff_short_stratum_delta_pp: "Short COE vs stratum",
      eff_long_stratum_delta_pp: "Long COE vs stratum",
      build_prog_share_pct: "Progressive %",
      build_final_third_share_pct: "Final third %",
      build_line_break_share_pct: "Line break %",
      chance_key_share_pct: "Key pass %",
      chance_box_share_pct: "Into box %",
      chance_impact_ft_share_pct: "Final-third impact %",
      chance_xpv_share_pct: "Creation xPV % of xP",
      chance_creation_xpv_per_pass: "Creation xPV / pass",
      prod_xpv_per_game: "xPV / game",
      prod_rel_xpv: "xPV residual",
      prec_coe_per_pass: "COE / pass",
      prec_z_coe_stratum: "COE stratum z",
      def_won_tackle_p90: "Tackles won / 90",
      def_interception_p90: "Interceptions / 90",
      def_clearance_p90: "Clearances / 90",
      def_recovery_p90: "Recoveries / 90",
      def_aerial_won_p90: "Aerials won / 90",
      def_block_p90: "Blocks / 90",
      def_tackle_won_pct: "Tackle won %",
      def_aerial_won_pct: "Aerial won %",
    },
    index: {
      Consistency: "How steady their per-match overall pass grades are (xp style: productivity, precision, lethality; low-volume games pulled toward 6.0).",
      Impact: "How much a player impacts the game per pass.",
      xp_idx_consistency: "How steady their per-match overall pass grades are (xp style: productivity, precision, lethality; low-volume games pulled toward 6.0).",
      xp_idx_impact: "How much a player impacts the game per pass.",
      xp_idx_defense: "Defensive volume and duel quality.",
    },
    passGrade: "Pass grade: 40% productivity, 40% precision, 20% lethality (league rank).",
    passLength: "Share of long passes vs league midpoint.",
    impactExtra: {
      threat_pass_pct: "Impact passes divided by total passes.",
      xpv_per_pass: "Average destination value on completed passes.",
      xp_residual_mean: "Mean edge over the geometric model per pass.",
    },
  },
  filters: {
    title: "Filters",
    subtitle: "Refine the player group and select a player.",
    searchPlaceholder: "Search player…",
    clearFilters: "Clear filters",
    age: "Age",
    height: "Height",
    nationality: "Nationality",
    subgroup: "Subgroup",
    league: "League",
    dominantFoot: "Dominant foot",
    ageBand: "Age band",
    passGrades: "Pass grades",
    regionCountries: "Region & countries",
  },
  positionFamilies: {
    midfielders: "Midfielders",
    allMidfielders: "All midfielders",
    centralMidfielders: "Central midfielders",
    attackingMidfielders: "Attacking midfielders",
  },
  gradeFilters: { all: "All" },
  footOptions: {
    all: "All",
    left: "Left",
    right: "Right",
    both: "Both",
  },
  ageBands: {
    all: "All ages",
    u21: "U21",
    u23: "U23",
    mid: "24–30",
    over30: "30+",
  },
  profileCategories: {
    all: {
      title: "All Players",
      subtitle: "Full curated pool",
      description: "Curated midfielders ranked by overall pass grade against the European pool.",
    },
    "top-overall-league": {
      title: "Top 5 Overall — Each League",
      subtitle: "Block 1 · League leaders",
      description: "Top five overall pass grades in each of the top-five European leagues.",
    },
    "top-overall-no-giants": {
      title: "Top 10 Outside Giants",
      subtitle: "Block 2 · Without elite clubs",
      description: "Top ten overall grades per league after removing the listed Champions League giants.",
    },
    "top-u23-league": {
      title: "Top 5 U23 — Each League",
      subtitle: "Block 3 · Young profiles",
      description: "Best under-23 overall pass grades in each top-five league.",
    },
  },
  groupLabels: {
    top10: "Top 10",
    extendedWatchlist: "Extended watchlist",
  },
};

const pt: Messages = {
  nav: {
    home: "Início",
    reports: "Relatórios",
    profile: "Perfil",
    compare: "Comparar",
    maps: "Mapas",
    players: "Jogadores",
  },
  lang: {
    switchToPt: "Português",
    switchToEn: "English",
  },
  brand: {
    name: "xP & xPV Analysis",
    nameMain: "xP & xPV ",
    nameAccent: "Analysis",
  },
  common: {
    loading: "Carregando…",
    search: "Buscar",
    player: "Jogador",
    players: "Jogadores",
    athletes: "atletas",
    age: "Idade",
    height: "Altura",
    nationality: "Nacionalidade",
    foot: "Pé",
    value: "Valor",
    contract: "Contrato",
    minutes: "Minutos",
    years: "anos",
    minutesPct: "% dos minutos possíveis",
    backToProfile: "Voltar ao perfil",
    fullProfile: "Perfil completo",
    viewMaps: "Ver mapas",
    compare: "Comparar",
    compareMaps: "Comparar mapas",
    exportPdf: "Exportar PDF",
    exportGroup: "Exportar grupo",
    unavailable: "Indisponível",
    loadFailed: "Falha ao carregar",
    noResults: "Nenhum jogador encontrado.",
    filter: "Filtrar",
    filtering: "Filtrando…",
    clear: "Limpar",
    allLeagues: "Todas as ligas",
    allPositions: "Todas as posições",
    game: "Jogo",
    match: "Partida",
    close: "Fechar",
    playerA: "Jogador A",
    playerB: "Jogador B",
    selectedGroup: "Grupo selecionado",
    reports: "relatórios",
    groups: "grupos",
    exportable: "exportável",
  },
  home: {
    eyebrow: "Análise de passes na Europa",
    lead:
      "Análise de passes dos principais meio-campistas de times fora da Champions League nas cinco grandes ligas europeias.",
    playersStat: "jogadores",
    leaguesStat: "ligas",
    modelStat: "modelo M4",
    modulesAria: "Módulos do xP & xPV Analysis",
    footnote: "",
    insightsAria: "Como funcionam xP e xPV",
    insightsTitle: "Entenda o modelo",
    insightsLead:
      "Um guia rápido das métricas por trás dos relatórios — feito para scouts e analistas, não para estatísticos.",
    insights: {
      xpv: {
        tag: "xPV",
        title: "Quanto vale chegar lá?",
        body:
          "O xPV mede quanto vale chegar num ponto do campo. Não pergunta se o passe vai chegar — pergunta se o destino é bom: avança o jogo, é um lugar raro ou estratégico, e é acessível na situação. Só entra quando o passe foi completado.",
      },
      xp: {
        tag: "xP",
        title: "Quão difícil era o passe?",
        body:
          "O xP mede quão difícil era completar esse passe — o “xG do passe”. Dado onde o jogador está, onde quer ir, a distância e o ângulo, quão provável era que a bola chegasse? Conta passes certos e errados.",
      },
      grades: {
        tag: "Grades",
        title: "Fácil de ler de relance",
        body:
          "As Pass Grades transformam o modelo em uma nota de 1 a 10, comparada aos pares da mesma posição. Um 8+ indica passe de elite entre meias europeus — não só dentro de uma liga.",
      },
      analyzed: {
        tag: "Escopo",
        title: "O que analisamos",
        body:
          "Mapas de passe, volume, consistência, progressão no terço final, criação de chances e trabalho defensivo. Juntos mostram como o jogador constrói o jogo, quando arrisca e onde machuca o adversário.",
      },
      mission: {
        tag: "Relatórios",
        title: "Por que este projeto existe",
        body:
          "Identificar meias com capacidade excepcional de passar a bola nas novas métricas — atletas que orquestram o jogo e criam valor pela distribuição, antes que o mercado capture isso por completo.",
      },
    },
    modules: {
      reports: {
        title: "Relatórios",
        description: "Relatórios PDF de 45 meias — grades xP, pass scores e mapas por faixa etária.",
      },
      profile: {
        title: "Perfil",
        description: "Perfil completo — radar de passes, índices xP e heatmaps de origem.",
      },
      compare: {
        title: "Comparar",
        description: "Compare dois jogadores lado a lado no mesmo pool de posição.",
      },
      maps: {
        title: "Mapas",
        description: "Mapas de passes e scatter — progressive, impact, line break e mais.",
      },
      players: {
        title: "Jogadores",
        description: "Lista completa do pool com ratings, filtros e ordenação por métrica.",
      },
    },
  },
  profile: {
    pageSubtitle: "Análise completa com pass scores, índices xP e rankings contra o pool europeu.",
    pageLead:
      "Análise completa por posição — xP, pass scores, índices e mapas de origem. Rankings dentro do pool selecionado.",
    loadingPool: "Carregando pool de jogadores…",
    loadingProfile: "Carregando perfil…",
    loadingPlayer: "Carregando perfil do jogador…",
    noPlayersInGroup: "Nenhum jogador encontrado neste grupo.",
    searchPlayer: "Buscar jogador",
    searchPlaceholder: "Nome do jogador…",
    selectPlayer: "Jogador",
    namePlaceholder: "Nome do jogador…",
    backendError: "Não foi possível conectar à API. Tente novamente em instantes.",
    backendRetryNote:
      "O backend pode levar alguns minutos no primeiro carregamento — tente novamente em instantes.",
    passOriginAlt: "Heatmap de origem dos passes",
    leagueFilter: {
      eyebrow: "Filtro de liga",
      ariaLabel: "Filtrar jogadores por liga",
    },
    modeToggleLabel: "Modo de números do perfil",
    modeAbsolute: "Absoluto",
    modeRelative: "Relativo",
    rankOf: "de",
    rankTopPct: "Top {pct}%",
    xpvPerGame: "xPV/Jogo",
    prodRelVolume: "Taxa de volume (relativo)",
    coePerPass: "COE/Pass",
    coeShortPass: "COE/Short Pass",
    coeLongPass: "COE/Long Pass",
    clusterTip: "Cluster k=4 de perfil de passe em métricas absolutas cruas. Cerca de {pct}% do pool elegível compartilha este arquétipo.",
  },
  players: {
    subtitle: "Jogadores das 5 grandes ligas com ratings de passe e pilares por pool.",
    loadingFilters: "Carregando filtros…",
    found: "jogador encontrado",
    foundPlural: "jogadores encontrados",
    viewReports: "Ver relatórios",
    loadFailed: "Falha ao carregar jogadores",
    searchPlaceholder: "Buscar jogador…",
    league: "Liga",
    passRating: "Pass Rating",
    volume: "Volume",
    efficiency: "Efficiency",
    buildup: "Build-up",
    chanceCreation: "Chance creation",
    defense: "Defense",
    reportsPromoTitle: "Relatórios",
    reportsPromoDesc: "Relatórios PDF — U23 Breakout, Prime Prospects 24–30 e Experience 30+",
    reportsPromoCta: "Ver relatórios",
  },
  compare: {
    subtitle: "Compare dois meias em pilares xP, pass scores e heatmaps de origem.",
    pageLead:
      "Compare dois meio-campistas do pool europeu. Métricas e notas são relativas aos pares da posição.",
    loading: "Carregando comparação…",
    backendUnavailable: "API indisponível — tente novamente em instantes.",
    pickerPlaceholder: "Digite o nome do jogador…",
    mapLoadFailed: "Falha ao carregar mapa",
    metric: "Métrica",
    radarAria: "Comparação radar de perfil de passe",
    passOriginAlt: "Heatmap de origem dos passes",
  },
  maps: {
    subtitle: "Mapas de passes do pool de meias.",
    generating: "Gerando mapas…",
    backendUnavailable: "API indisponível — tente novamente em instantes.",
    aggregateNote: "Visão agregada · top 250 por volume",
    noScatterData: "Sem dados para scatter.",
    scatterCaption: "jogadores · linhas douradas = média",
    scatterView: "Scatter",
    passMapView: "Mapa de passes",
    passMapAlt: "Mapa de passes",
    destMapAlt: "Heatmap de destino",
    commonPassesAlt: "Passes comuns",
    rarePassesAlt: "Passes raros",
  },
  mapFilters: {
    progressive: "Passes progressivos",
    test_impact_v2: "Impact Passes",
    line_break: "Line breaks",
    key_passes: "Key Passes",
    long_passes: "Passes longos",
    report_progressive_origin: "Progressive Pass · Origem",
    report_progressive_dest: "Progressive Pass · Destino",
    report_impact_final_third: "Impact Passes · Terço Final",
    report_impact_passes: "Impact Passes",
  },
  reports: {
    heroTitle: "Relatórios de meias",
    heroSubtitle: "Pool curado com rankings no pool completo — exporte PDF por faixa etária.",
    heroLead:
      "{count} perfis curados em 3 faixas etárias — overview xP, pass scores, consistency e mapas de passe. Exportação PDF por grupo.",
    scoutingEyebrow: "Scouting intelligence",
    preparingMaps: "Preparando mapas…",
    loadingBatches: "Carregando relatórios em lotes…",
    loadingFirst: "Carregando primeiros relatórios…",
    loadingPlayer: "Carregando jogador…",
    loadingPlayerId: "Carregando {id}…",
    loadPlayerFailed: "Falha ao carregar jogador",
    loadPlayerFailedPrefix: "Falha ao carregar jogador",
    pageFootnote: "atletas · pool meio-campistas · 5 ligas europeias",
    exportPdfTitle: "Exportar PDF de",
    generatingMaps: "Gerando mapas do jogador…",
    loadingMaps: "Carregando mapas…",
    readyStat: "prontos",
    inGroupStat: "no grupo",
    mapsLoadHint: "mapas carregam ao exportar PDF",
    overview: "Overview",
    passMapsEyebrow: "Pass Maps",
    mapsPageLabel: "Mapas",
    midfielderReportLabel: "Relatório de Meias",
    midfielderReportEyebrow: "Relatório de Meias",
    backToProfile: "Voltar ao perfil",
    viewMaps: "Ver mapas",
    progressivePassesBlock: "Progressive Passes (Origin & Destination)",
    reportMapOrigin: "Origem",
    reportMapDestination: "Destino",
    reportImpactPassesTitle: "Impact Passes",
    progressiveLinkPasses: "{count} passes",
    minutesShort: "Min",
    ageYears: "{age} anos",
    categories: {
      all: {
        title: "Todos os jogadores",
        description: "Pool completo de 45 meio-campistas.",
      },
      u23: {
        title: "U23",
        description: "Perfis sub-23 em destaque.",
      },
      mid: {
        title: "24–30",
        description: "Meias em idade de pico.",
      },
      over30: {
        title: "30+",
        description: "Perfis experientes.",
      },
    },
  },
  sections: {
    xpProfile: "Perfil xP",
    passScores: "Pass Scores",
    badges: "Badges",
    xpIndices: "Índices xP",
    xpPillars: "Pilares xP",
    passProfile: "Perfil de passes",
    passProfileCluster: "Tipo de perfil",
  },
  badges: {
    organizer: "Organizador",
    organizerTooltip:
      "Alto xPV/Pass e volume de passes, Impact Rate abaixo da mediana e COE em passes curtos forte vs o pool de médios.",
    prodRelLift: "Share no time",
    prodRelLiftTooltip:
      "Produtividade relativa supera a geral por {gap} pts — acima do P70 no pool de médios elegíveis (corte {p70}; média do pool {mean}).",
    precStratumLift: "Extrato de volume",
    precStratumLiftTooltip:
      "COE no extrato supera o COE geral por {gap} pts — acima do P70 no pool elegível (corte {p70}; média do pool {mean}).",
  },
  roundStats: {
    grade: "Nota",
    passes: "Passes",
    xpv: "xPV",
    xpPerPass: "xP",
    breakline: "Line breaks",
    impact: "Impact passes",
    keyPasses: "Key passes",
    chartAria: "Notas por rodada",
  },
  stratumStar: "Top quartil vs pares de volume de passe",
  passGrade: {
    title: "Nota de passe",
    unavailable: "Nota indisponível",
    overallTitle: "Nota geral",
    overallTip: "Nota de passe ponderada: 40% produtividade, 40% precisão, 20% lethality (notas estilo Sofascore na liga).",
    general: "Geral",
    expected: "Esperado",
    generalTip:
      "Média das notas de Produtividade Geral e Precisão Geral (escala Sofascore por ranking na liga).",
    expectedTip:
      "Média das notas de Produtividade Esperada e Precisão Esperada (COE stratum).",
    tiers: {
      elite: "Elite",
      veryGood: "Muito bom",
      good: "Bom",
      average: "Médio",
      belowAverage: "Abaixo da média",
    },
  },
  productivity: {
    title: "Produtividade",
    general: "Geral",
    relative: "Relativa",
    expected: "Esperado",
    generalTip:
      "Nota Sofascore pelo ranking de xPV por jogo na sua liga (melhor médio = melhor nota).",
    relativeTip:
      "xPV/jogo vs esperado do modelo híbrido ({gap} vs esperado; real {actual}, esperado {expected}). Escala 0–100 na liga.",
    expectedTip:
      "Nota Sofascore pelo ranking do residual xPV híbrido na liga ({gap} residual; real {actual}, esperado {expected}).",
  },
  precision: {
    title: "Precisão",
    general: "Geral",
    expected: "Esperado",
    coeTip:
      "COE por passe ({coe} pp; real {actual}%, esperado {expected}%). Nota Sofascore por ranking na liga.",
    generalCoe: "COE geral (todos os passes)",
    stratumCoe: "COE no extrato de volume",
    generalCoeTip:
      "Nota Sofascore pelo ranking de COE por passe na sua liga.",
    stratumCoeTip:
      "Nota Sofascore do COE total vs pares no mesmo quartil de volume de passes na liga.",
  },
  lethality: {
    title: "Letalidade",
    xpvPerPass: "xPV / passe",
    impactRate: "Taxa de impacto",
    xpvPerPassTip:
      "Valor de destino por passe completado ({value}). Escala 0–100 na liga — o melhor médio da liga = 100.",
    impactRateTip:
      "% de passes classificados como impact passes ({value}%). Escala 0–100 na liga — o melhor da liga = 100.",
  },
  passLengthMix: {
    title: "Mix de comprimento de passe",
    short: "Curto",
    long: "Longo",
    leagueRefTitle: "Referência da liga: {pct}% longo",
    playerLongTitle: "Jogador: {pct}% longo",
    shortLegend: "{pct}% curto",
    longLegend: "{pct}% longo",
  },
  tooltips: {
    xpProfileBars: {
      xp_activity_display: "Quanto valor geram por jogo.",
      xp_efficiency_display:
        "Precisão de passe: COE por passe, escala 0–100 na liga (melhor da liga = 100).",
      xp_edge_display:
        "Letalidade: xPV por passe e taxa de impact passes, cada um em escala 0–100 na liga.",
    },
    passScores: {
      Volume: "Quanto o jogador passa.",
      Efficiency: "Quão limpo é o passe.",
      Lethality: "Ameaça por passe: valor de destino e taxa de impact passes.",
      "Build-up": "Progressão e quebra de linha.",
      "Chance creation": "Passes que ameaçam o gol.",
      Impact: "xPV/Pass e Impact Rate combinados.",
      "Defensive Contribution": "Volume defensivo e qualidade de duelo.",
    },
    components: {
      passes_total: "Ritmo de passe.",
      long_balls: "Distribuição longa.",
      xpass_coe_pct: "Vantagem no passe curto.",
      xpass_total_coe_pct: "Vantagem geral de conclusão.",
      xpass_long_coe_pct: "Vantagem no passe longo.",
      progressive_passes: "Progressão para frente.",
      final_third_passes: "Entradas no terço final.",
      key_passes: "Passes que geram chute.",
      passes_to_box: "Passes na área.",
      special_line_break_p90: "Ameaça de quebra de linha.",
      test_impact_v2_start_final_third_p90: "Perigo no terço final.",
      defensive_actions_p90: "Desarmes, interceptações e cortes.",
      chance_creation_xpv: "Qualidade na criação de chances.",
      threat_pass_pct: "Impact passes sobre o total de passes.",
      def_won_tackle_p90: "Desarmes ganhos.",
      def_interception_p90: "Interceptações.",
      def_clearance_p90: "Cortes.",
      def_recovery_p90: "Recuperações.",
      def_aerial_won_p90: "Duelos aéreos ganhos.",
      def_block_p90: "Bloqueios.",
      def_tackle_won_pct: "Taxa de desarme.",
      def_aerial_won_pct: "Taxa aérea.",
      xpv_per_pass: "Valor médio de destino por passe.",
      xp_residual_mean: "Quanto superam o modelo esperado.",
      vol_passes_team_share_pct: "Participação nos passes do time.",
      vol_long_team_share_pct: "Participação nos longos do time.",
      eff_short_stratum_delta_pp: "COE curto acima do estrato de volume.",
      eff_long_stratum_delta_pp: "COE longo acima do estrato de volume.",
      build_prog_share_pct: "Passes progressivos como % do total.",
      build_final_third_share_pct: "Terço final como % dos passes.",
      build_line_break_share_pct: "Line breaks como % dos passes.",
      chance_key_share_pct: "Key passes como % dos passes.",
      chance_box_share_pct: "Passes na área como % dos passes.",
      chance_impact_ft_share_pct: "Impacto terço final como % dos passes.",
      chance_xpv_share_pct: "xPV de criação como % do xP/jogo.",
      chance_creation_xpv_per_pass:
        "xPV de criação por passe de criação (key + na área + impact terço final).",
      chance_creation_xpv_per_game: "xPV de criação por jogo.",
      prod_rel_xpv: "Residual de xPV vs volume esperado.",
      prec_z_coe_stratum: "Z-score de COE no estrato de volume.",
    },
    componentLabels: {
      passes_total: "Passes / jogo",
      long_balls: "Passes longos / jogo",
      xpass_coe_pct: "%Eff - Passe Curto",
      xpass_long_coe_pct: "%Eff - Passe Longo",
      progressive_passes: "Passes progressivos / jogo",
      final_third_passes: "Entradas terço final / jogo",
      key_passes: "Key passes / jogo",
      passes_to_box: "Na área / jogo",
      special_line_break_p90: "Line breaks / jogo",
      test_impact_v2_start_final_third_p90: "I.P. no Terço Final / jogo",
      defensive_actions_p90: "Ações defensivas / 90",
      chance_creation_xpv: "Creation value",
      chance_creation_xpv_per_game: "Creation value / jogo",
      threat_pass_pct: "Impact rate",
      vol_passes_team_share_pct: "Passes vs time",
      vol_long_team_share_pct: "Longos vs time",
      eff_short_stratum_delta_pp: "COE curto vs estrato",
      eff_long_stratum_delta_pp: "COE longo vs estrato",
      build_prog_share_pct: "Progressivo %",
      build_final_third_share_pct: "Terço final %",
      build_line_break_share_pct: "Line break %",
      chance_key_share_pct: "Key pass %",
      chance_box_share_pct: "Na área %",
      chance_impact_ft_share_pct: "Impacto terço final %",
      chance_xpv_share_pct: "xPV criação % do xP",
      chance_creation_xpv_per_pass: "xPV criação / passe",
      prod_xpv_per_game: "xPV / jogo",
      prod_rel_xpv: "Residual xPV",
      prec_coe_per_pass: "COE / passe",
      prec_z_coe_stratum: "COE estrato z",
      def_won_tackle_p90: "Desarmes / 90",
      def_interception_p90: "Interceptações / 90",
      def_clearance_p90: "Cortes / 90",
      def_recovery_p90: "Recuperações / 90",
      def_aerial_won_p90: "Aéreos / 90",
      def_block_p90: "Bloqueios / 90",
      def_tackle_won_pct: "Desarme %",
      def_aerial_won_pct: "Aéreo %",
    },
    index: {
      Consistency: "Quão estáveis são as notas compostas por jogo (produção, qualidade, ameaça e precisão).",
      Impact: "Quanto o jogador impacta o jogo por passe.",
      xp_idx_consistency: "Quão estáveis são as notas gerais de passe por jogo (estilo xp: produtividade, precisão, letalidade; jogos de baixo volume puxados a 6,0).",
      xp_idx_impact: "Quanto o jogador impacta o jogo por passe.",
      xp_idx_defense: "Volume defensivo e qualidade de duelo.",
    },
    passGrade: "Nota de passe: 40% produtividade, 40% precisão, 20% lethality (ranking na liga).",
    passLength: "Share de passes longos vs média da liga.",
    impactExtra: {
      threat_pass_pct: "Impact passes dividido pelo total de passes.",
      xpv_per_pass: "Valor médio de destino nos passes completados.",
      xp_residual_mean: "Média de superação do modelo geométrico.",
    },
  },
  filters: {
    title: "Filtros",
    subtitle: "Refine o grupo de jogadores e selecione o jogador.",
    searchPlaceholder: "Buscar jogador…",
    clearFilters: "Limpar filtros",
    age: "Idade",
    height: "Altura",
    nationality: "Nacionalidade",
    subgroup: "Subgrupo",
    league: "Liga",
    dominantFoot: "Pé dominante",
    ageBand: "Faixa etária",
    passGrades: "Notas de passe",
    regionCountries: "Região e países",
  },
  positionFamilies: {
    midfielders: "Meio-campistas",
    allMidfielders: "Todos os meio-campistas",
    centralMidfielders: "Meio-campistas centrais",
    attackingMidfielders: "Meio-campistas ofensivos",
  },
  gradeFilters: { all: "Todas" },
  footOptions: {
    all: "Todos",
    left: "Esquerdo",
    right: "Direito",
    both: "Ambidestro",
  },
  ageBands: {
    all: "Todas as idades",
    u21: "U21",
    u23: "U23",
    mid: "24–30",
    over30: "30+",
  },
  profileCategories: {
    all: {
      title: "Todos os jogadores",
      subtitle: "Pool completo",
      description: "Meias curados ranqueados pela nota geral de passe no pool europeu.",
    },
    "top-overall-league": {
      title: "Top 5 geral — cada liga",
      subtitle: "Bloco 1 · Líderes por liga",
      description: "Cinco melhores notas gerais de passe em cada uma das cinco grandes ligas.",
    },
    "top-overall-no-giants": {
      title: "Top 10 fora dos gigantes",
      subtitle: "Bloco 2 · Sem clubes elite",
      description: "Dez melhores notas gerais por liga após remover os gigantes listados.",
    },
    "top-u23-league": {
      title: "Top 5 U23 — cada liga",
      subtitle: "Bloco 3 · Perfis jovens",
      description: "Melhores notas gerais sub-23 em cada uma das cinco grandes ligas.",
    },
  },
  groupLabels: {
    top10: "Top 10",
    extendedWatchlist: "Lista estendida",
  },
};

export const MESSAGES: Record<Locale, Messages> = { en, pt };

export const DEFAULT_LOCALE: Locale = "en";
