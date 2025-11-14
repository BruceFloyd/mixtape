import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Create from './pages/Create';
import MixtapePlayer from './pages/MixtapePlayer';
import MyMixtapes from './pages/MyMixtapes';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/mixtape/:slug" element={<MixtapePlayer />} />
          <Route path="/my-mixtapes" element={<MyMixtapes />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
