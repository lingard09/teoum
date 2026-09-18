import { Navigate, Route, Routes } from 'react-router-dom'
import MyPage from './pages/MyPage/MyPage.jsx'
import UpcomingTab from './pages/MyPage/UpcomingTab.jsx'
import CoursesTab from './pages/MyPage/CoursesTab.jsx'
import ScrapsTab from './pages/MyPage/ScrapsTab.jsx'
import ExperiencesPage from './pages/Experiences/ExperiencesPage.jsx'
import StaysPage from './pages/Stays/StaysPage.jsx'
import BookingPage from './pages/Booking/BookingPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/experiences" replace />} />
      <Route path="/experiences" element={<ExperiencesPage />} />
      <Route path="/stays" element={<StaysPage />} />
      <Route path="/stays/reserve" element={<BookingPage />} />
      <Route path="/mypage" element={<MyPage />}>
        <Route index element={<Navigate to="upcoming" replace />} />
        <Route path="upcoming" element={<UpcomingTab />} />
        <Route path="courses" element={<CoursesTab />} />
        <Route path="scraps" element={<ScrapsTab />} />
      </Route>
      <Route path="*" element={<Navigate to="/experiences" replace />} />
    </Routes>
  )
}

export default App
