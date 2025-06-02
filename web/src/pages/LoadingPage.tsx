import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoadingPage = () => {
const navigate = useNavigate();

useEffect(() => {
    navigate("/image_upload", { replace: true });
}, [navigate]);

return (
    <div className="loading-container">
    <h1>読み込み中...</h1>
    <p>ページを準備しています</p>
    <div className="spinner" />
    </div>
);
};

export default LoadingPage;