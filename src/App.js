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
import { HelmetProvider } from 'react-helmet-async';
import SearchResults from './pages/SearchResults';
import AdminLogin from "./pages/AdminLogin";
import AdminPage from "./pages/AdminPage";
import ManageListings from "./pages/ManageListings";

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Navbar />
        <ScrollToTop />
        <Layout>
        <Routes>
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/:categoryId/listings" element={<ManageListings />} />
          <Route path="/" element={<Home />} />
          <Route path="/gyms" element={<Gyms />} />
          <Route path="/hotels" element={<Hotels />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/events" element={<Events />} />
          <Route path="/:collectionName/:id" element={<DetailPage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Layout>
      </Router>
    </HelmetProvider>
  );
}

export default App;