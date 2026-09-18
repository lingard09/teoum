import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Header from './components/Header/Header.jsx'
import HomePage from './pages/HomePage.jsx'
import MapSearchPage from './pages/MapSearchPage.jsx'
import MyPage from './pages/MyPage/MyPage.jsx'
import UpcomingTab from './pages/MyPage/UpcomingTab.jsx'
import CoursesTab from './pages/MyPage/CoursesTab.jsx'
import ScrapsTab from './pages/MyPage/ScrapsTab.jsx'
import ExperiencesPage from './pages/Experiences/ExperiencesPage.jsx'
import StaysPage from './pages/Stays/StaysPage.jsx'
import BookingPage from './pages/Booking/BookingPage.jsx'
import CoursesPage from './pages/Courses/CoursesPage.jsx'
import PlannerPage from './pages/Planner/PlannerPage.jsx'

// 홈/지도탐색 전용 레이아웃. 디자인 토큰과 전역 리셋을 .hanok-app 스코프
// 안에서만 적용해서(styles/tokens.css, styles/global.css 참고) /mypage쪽
// 팀 공통 스타일(src/index.css, CSS Modules)에 영향을 주지 않는다.
function HanokLayout() {
  return (
    <div className="hanok-app">
      <Header />
      <Outlet />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<HanokLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapSearchPage />} />
      </Route>

      <Route path="/experiences" element={<ExperiencesPage />} />
      <Route path="/stays" element={<StaysPage />} />
      <Route path="/stays/reserve" element={<BookingPage />} />
      <Route path="/plan" element={<CoursesPage />} />
      <Route path="/plan/result" element={<PlannerPage />} />

      <Route path="/mypage" element={<MyPage />}>
        <Route index element={<Navigate to="upcoming" replace />} />
        <Route path="upcoming" element={<UpcomingTab />} />
        <Route path="courses" element={<CoursesTab />} />
        <Route path="scraps" element={<ScrapsTab />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
