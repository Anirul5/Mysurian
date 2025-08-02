import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gyms from './pages/Gyms';
import Hotels from './pages/Hotels';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Navbar />
      <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gyms" element={<Gyms />} />
        <Route path="/hotels" element={<Hotels />} />
      </Routes>
      </Layout>
    </Router>
  );
}

export default App;