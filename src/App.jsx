import { Navigate, Route, Routes } from 'react-router-dom'
import MyPage from './pages/MyPage/MyPage.jsx'
import UpcomingTab from './pages/MyPage/UpcomingTab.jsx'
import CoursesTab from './pages/MyPage/CoursesTab.jsx'
import ScrapsTab from './pages/MyPage/ScrapsTab.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/mypage" replace />} />
      <Route path="/mypage" element={<MyPage />}>
        <Route index element={<Navigate to="upcoming" replace />} />
        <Route path="upcoming" element={<UpcomingTab />} />
        <Route path="courses" element={<CoursesTab />} />
        <Route path="scraps" element={<ScrapsTab />} />
      </Route>
      <Route path="*" element={<Navigate to="/mypage" replace />} />
    </Routes>
  )
}

export default App
