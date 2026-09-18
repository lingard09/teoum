import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import RegionSearchBar from "../components/map/RegionSearchBar.jsx";
import QuickFilterRow from "../components/map/QuickFilterRow.jsx";
import TourismListPanel from "../components/map/TourismListPanel.jsx";
import MapView from "../components/map/MapView.jsx";
import { fetchAllVillages } from "../api/villageApi.js";
import { regionFilters } from "../data/mapFilters.js";
import "./MapSearchPage.css";

function initialRegionFromParams(searchParams) {
  const label = searchParams.get("region");
  return regionFilters.find((r) => r.label === label)?.id ?? null;
}

function MapSearchPage() {
  const [searchParams] = useSearchParams();
  const [villages, setVillages] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState(() => initialRegionFromParams(searchParams));
  const [quickFilter, setQuickFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [activeId, setActiveId] = useState(() => searchParams.get("highlight") || "jeonju");

  useEffect(() => {
    fetchAllVillages({ region, keyword }).then(setVillages);
  }, [region, keyword]);

  const visibleVillages = useMemo(() => {
    let list = villages.filter((v) => {
      if (quickFilter === "unesco") return v.unesco;
      if (quickFilter === "night") return v.event?.includes("야간");
      return true;
    });

    const effectiveSort = quickFilter === "congestion" ? "congestion" : sortBy;
    if (effectiveSort === "visitors") {
      // 혼잡도 점수는 지역 방문자수 순위에서 나온 값이라, 높을수록 방문자가 많다.
      list = [...list].sort((a, b) => (b.congestion?.score ?? 0) - (a.congestion?.score ?? 0));
    } else if (effectiveSort === "congestion") {
      list = [...list].sort(
        (a, b) => (a.congestion?.score ?? 99) - (b.congestion?.score ?? 99)
      );
    } else if (effectiveSort === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ko"));
    }
    // "popular"은 TourAPI가 내려준 순서를 그대로 쓴다.

    return list;
  }, [villages, quickFilter, sortBy]);

  return (
    <main className="map-search-page">
      <RegionSearchBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        region={region}
        onRegionChange={setRegion}
      />
      <QuickFilterRow active={quickFilter} onChange={setQuickFilter} />

      <div className="map-search-page__body">
        <TourismListPanel
          villages={visibleVillages}
          sortBy={sortBy}
          onSortChange={setSortBy}
          activeId={activeId}
          onSelect={setActiveId}
        />
        <MapView villages={visibleVillages} activeId={activeId} onSelect={setActiveId} />
      </div>
    </main>
  );
}

export default MapSearchPage;
