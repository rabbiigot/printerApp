import './App.css';

import Home from './components/homepage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrintMethod from './components/print/transferMethod';
import QRMethod from './components/print/qrMethod';
import Flashdrive from './components/print/flashdrive';
import Copy from './components/copy/copy';

function App() {
  return (
    <Router> {/* Move Router here to wrap everything */}
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/print" element={<PrintMethod />} />
          <Route path="/print/qrscan" element={<QRMethod />} />
          <Route path="/print/flashdrive" element={<Flashdrive />} />
          <Route path="/copy" element={<Copy />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
