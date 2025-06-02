import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ImageUploadPage from "./pages/ImageUploadPage";
import LoadingPage from "./pages/LoadingPage";
import MainLayout from './components/layout/MainLayout';

import "./styles/global.css";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoadingPage />} />

        <Route element={<MainLayout />}>
          <Route path="/image_upload" element={<ImageUploadPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;