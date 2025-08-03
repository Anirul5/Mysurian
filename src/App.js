import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Gyms from './pages/Gyms';
import Hotels from './pages/Hotels';
import Layout from './components/Layout';
import Restaurants from './pages/Restaurants';
import Events from './pages/Events';
import DetailPage from './pages/DetailPage';
import ScrollToTop from './components/ScrollToTop';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <Navbar />
       <ScrollToTop />
      <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gyms" element={<Gyms />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/events" element={<Events />} />
        <Route path="/:collectionName/:id" element={<DetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Layout>
    </Router>
  );
}

export default App;