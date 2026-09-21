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
      // 지역별 방문자수(DataLab 실데이터) 순. 혼잡도와는 별개 값이다.
      list = [...list].sort((a, b) => (b.visitorScore ?? 0) - (a.visitorScore ?? 0));
    } else if (effectiveSort === "congestion") {
      // 집중률 예측이 없는 장소는 뒤로 보낸다(0으로 두면 가장 한산한 척이 된다).
      list = [...list].sort(
        (a, b) => (a.congestion?.rate ?? 999) - (b.congestion?.rate ?? 999)
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
