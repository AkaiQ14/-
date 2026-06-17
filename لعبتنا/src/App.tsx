import { Navigate, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home       from './pages/Home'
import Games      from './pages/Games'
import Setup      from './pages/Setup'
import LetterCell from './pages/LetterCell'
import MyGames    from './pages/MyGames'
import Play       from './pages/Play'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/"                      element={<Home />}       />
        <Route path="/games"                 element={<Games />}      />
        <Route path="/games/laabtna/setup"  element={<Setup />}      />
        <Route path="/games/letter-cell"     element={<LetterCell />} />
        <Route path="/start-game"           element={<Navigate to="/games" replace />} />
        <Route path="/my-games"             element={<MyGames />}    />
        <Route path="/play"                 element={<Play />}       />
      </Routes>
    </Layout>
  )
}
