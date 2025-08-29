import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import DetailPage from "./pages/DetailPage";
import ScrollToTop from "./components/ScrollToTop";
import NotFound from "./pages/NotFound";
import { HelmetProvider } from "react-helmet-async";
import SearchResults from "./pages/SearchResults";
import AdminLogin from "./pages/AdminLogin";
import AdminPage from "./pages/AdminPage";
import AdminManageListings from "./pages/AdminManageListings";
import ListingForm from "./pages/ListingForm";
import SchemaEditor from "./pages/SchemaEditor";
import CategoryPage from "./pages/CategoryPage";
import CategoriesListPage from "./pages/CategoriesListPage";
import PrivateRoute from "./components/PrivateRoute";
import { HomeDataProvider } from "./context/HomeDataContext";
import FavoritesPage from "./pages/FavoritesPage";
import Careers from "./pages/Careers";

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Navbar />
        <HomeDataProvider>
          <ScrollToTop />
          <Layout>
            <Routes>
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/:categoryId/listings"
                element={
                  <PrivateRoute>
                    <AdminManageListings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/:categoryId/listings/new"
                element={
                  <PrivateRoute>
                    <ListingForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/:categoryId/listings/:listingId/edit"
                element={
                  <PrivateRoute>
                    <ListingForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/:categoryId/schema"
                element={
                  <PrivateRoute>
                    <SchemaEditor />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Home />} />
              <Route
                path="/category/:categoryName"
                element={<CategoryPage />}
              />
              <Route path="/categories" element={<CategoriesListPage />} />
              <Route path="/:collectionName/:id" element={<DetailPage />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </HomeDataProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
