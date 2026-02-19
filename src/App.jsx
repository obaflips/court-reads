import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import BookDetail from './pages/BookDetail'
import BuildLineup from './pages/BuildLineup'
import HallOfFame from './pages/HallOfFame'
import SeriesDetail from './pages/SeriesDetail'
import Draft from './pages/Draft'
import ScoutReports from './pages/ScoutReports'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/draft" element={<Draft />} />
      <Route path="/quick-pick" element={<BuildLineup />} />
      <Route path="/build-lineup" element={<Navigate to="/quick-pick" replace />} />
      <Route path="/scout-reports" element={<ScoutReports />} />
      <Route path="/about" element={<Navigate to="/" replace />} />
      <Route path="/book/:id" element={<BookDetail />} />
      <Route path="/hall-of-fame" element={<HallOfFame />} />
      <Route path="/series/:seriesId" element={<SeriesDetail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
