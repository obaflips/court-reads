import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import BookDetail from './pages/BookDetail'
import BuildLineup from './pages/BuildLineup'
import HallOfFame from './pages/HallOfFame'
import SeriesDetail from './pages/SeriesDetail'
import Draft from './pages/Draft'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/book/:id" element={<BookDetail />} />
      <Route path="/build-lineup" element={<BuildLineup />} />
      <Route path="/hall-of-fame" element={<HallOfFame />} />
      <Route path="/series/:seriesId" element={<SeriesDetail />} />
      <Route path="/draft" element={<Draft />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
