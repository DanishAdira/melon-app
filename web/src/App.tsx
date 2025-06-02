// src/App.tsx (ヘッダーとフッターをフルワイドにする場合の修正案)
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ImageUploadPage from "./pages/ImageUploadPage";
import LoadingPage from "./pages/LoadingPage";
import AppHeader from './components/layout/AppHeader';
import AppFooter from './components/layout/AppFooter';

import "./styles/global.css";

const App = () => {
  return (
    <BrowserRouter>
      <AppHeader />

      <div className="app-container">
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LoadingPage />} />
            <Route path="/image_upload" element={<ImageUploadPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      <AppFooter />
    </BrowserRouter>
  );
};

export default App;