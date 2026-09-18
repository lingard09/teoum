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
    if (effectiveSort === "rating") {
      list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (effectiveSort === "congestion") {
      list = [...list].sort(
        (a, b) => (a.congestion?.score ?? 99) - (b.congestion?.score ?? 99)
      );
    } else if (effectiveSort === "distance") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    // "popular" (TourAPI 인기순) keeps the API-provided display order.

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
