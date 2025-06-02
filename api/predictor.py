import gradio as gr
import torch
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFile
import albumentations as A
from albumentations.pytorch import ToTensorV2
import cv2
import argparse
import pandas as pd
import os
import tempfile
from skimage.morphology import skeletonize
from scipy.ndimage import convolve
from scipy.spatial import KDTree
from skimage.draw import line
import pyheif
from sklearn.cluster import DBSCAN
from datetime import datetime

# パス設定（Docker使用時は要修正）
sys.path.append('/app/api/models')

from models import create_model
from ultralytics import YOLO

ImageFile.LOAD_TRUNCATED_IMAGES = True

# デバイス設定
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 前処理
def get_augmentation_validation():
    return A.Compose([
        A.Resize(512, 512),
        A.Normalize((0.5,), (0.5,)),
        A.CenterCrop(256, 256),
        ToTensorV2()
    ], is_check_shapes=False)

# ローカルでモデルをロード
yolo_path = "/app/api/models/yolo-seg.pt"           # yoloモデルのパス設定
unet_path = "/app/api/models/best_model.pth"        # UNetモデルのパス設定

# YOLOモデル（メロン検出）
get_melon_model = YOLO(yolo_path).to(device)            # yoloモデルの読み込みとデバイスの設定
get_melon_model.eval()                                  # メロンの位置推定用のyoloモデルを検証モードに変更

# UNetモデル（網目検出）
get_net_model = create_model({"name": "UNet", "encoder_name": "resnet50"})  # 網目検出モデルの定義
checkpoint = torch.load(unet_path, map_location=device)                     # チェックポイントのロード
get_net_model.load_state_dict(checkpoint["model_state_dict"])               # 定義したモデルにチェックポイントをロード  
get_net_model = get_net_model.to(device)                                    # デバイスの設定
get_net_model.eval()                                                        # メロンの網目推定用のUNetモデルを検証モードに変換

# HEICファイルの読み込み
def load_image(image_path):
    ext = Path(image_path).suffix.lower()   # アップロードされた画像の拡張子を取得

    if ext == ".heic":
        with open(image_path, "rb") as f:
            heif_file = pyheif.read(f.read())
        image_pil = Image.frombytes(
            heif_file.mode,
            heif_file.size,
            heif_file.data,
            "raw",
            heif_file.mode,
            heif_file.stride,
        )
        return image_pil
    else:
        image_pil = Image.open(image_path)
        return image_pil

# 画像の読み込みと二値化
def load_and_binarize_image(image_path, threshold=100):
    img_gray = cv2.imread(str(image_path), cv2.IMREAD_GRAYSCALE)
    img_blur = cv2.blur(img_gray, (9, 9))
    _, binary_image = cv2.threshold(img_blur, threshold, 255, cv2.THRESH_BINARY)
    return binary_image

# 画像の細線化
def thin_image(binary_image):
    binary_normalized = binary_image // 255
    skeleton = skeletonize(binary_normalized).astype(np.uint8) * 255
    return skeleton

# 分岐点の計算
def calculate_branch_points(skeleton_image, eps=5):
    kernel = np.array([[1, 1, 1],
                       [1, 10, 1],
                       [1, 1, 1]])
    filtered = convolve(skeleton_image // 255, kernel, mode='constant', cval=0)
    
    raw_branch_points = np.column_stack(np.where(filtered >= 13))
    
    if len(raw_branch_points) == 0:
        return 0
    
    clustering = DBSCAN(eps=eps,min_samples=1).fit(raw_branch_points)
    
    return len(set(clustering.labels_))  # 分岐点の個数 

# 網目密度の計算
def calculate_density(img_binary):
    pixel_count = np.size(img_binary)
    pixel_sum = np.sum(img_binary)
    white_pixel_count = pixel_sum / 255
    density = white_pixel_count / pixel_count

    return density

# 検出位置の表示
def make_center_box(trim_image):
    trim_image = cv2.resize(trim_image, (224, 224))
    
    h, w = trim_image.shape[:2]
    cx1, cy1 = int(w * 0.25), int(h * 0.25)
    cx2, cy2 = int(w * 0.75), int(h * 0.75)
    cv2.rectangle(trim_image, (cx1, cy1), (cx2, cy2), color=(225, 0, 0), thickness=2)

    return trim_image

# マスク作成
def make_mask(uploaded_file_path):
    image_file = load_image(uploaded_file_path)     # 画像の読み込み

    # ローカル環境に入力した画像を保存
    save_dir = "/app/output"        # 保存先ディレクトリ    docker使用時は要修正
    os.makedirs(save_dir, exist_ok=True)            # ディレクトリが存在しない場合は作成
    
    now = datetime.now()
    timestamp = now.strftime("%Y%m%d_%H%M%S")         # タイムスタンプの生成
    filename = f"App_{timestamp}.jpg"
    input_image = os.path.join(save_dir, filename)  # 保存するファイルのパス
    image_file.save(input_image)  # 一時的に保存

    image = np.array(image_file.convert("RGB"))     # 入力画像をRGBに変換してnumpy配列に

    result = get_melon_model(image)[0]              # YOLOでメロン検出
    bbox = result.boxes.xyxyn[0].cpu().numpy()      # bboxの取得
    x1, y1, x2, y2 = bbox * np.array([image.shape[1], image.shape[0], image.shape[1], image.shape[0]])  # bboxの座標を取得
    image = image[int(y1):int(y2), int(x1):int(x2)] # メロンの部分を切り抜く

    center_image = make_center_box(image)           # 検出位置を表示

    transform = get_augmentation_validation()       # 入力画像の前処理
    transformed = transform(image=image)["image"].unsqueeze(0).to(device)

    with torch.no_grad():
        output = get_net_model(transformed)         # UNetモデルで網目を推定
        prob = torch.sigmoid(output)
        pred = (prob > 0.50).float().squeeze().cpu().numpy()

    predicted_image = (pred * 255).astype(np.uint8)

    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmpfile:
        cv2.imwrite(tmpfile.name, np.array(predicted_image))  
        temp_image_path = tmpfile.name

    # マスク画像から指標を計算
    binary_image = load_and_binarize_image(temp_image_path)
    skeleton_image = thin_image(binary_image)
    branch_points = calculate_branch_points(skeleton_image)

    net_density = calculate_density(binary_image)  # 網目密度の計算

    os.remove(temp_image_path)  # 一時ファイル削除

    return  round(net_density * 100,2), branch_points, center_image, predicted_image 

# Gradioインターフェース
interface = gr.Interface(
    fn=make_mask,
    inputs=gr.Image(type="filepath", label="画像をアップロードしてください"),
    outputs=[
        gr.Textbox(label="網目密度"),
        gr.Textbox(label="分岐点数"),
        gr.Image(type="pil", label="検出位置"),
        gr.Image(type="pil", label="網目推定画像")
    ],
    title="品質評価アプリケーション ver.1.0",
    description="メロンの画像から網目を検出します．\n網目密度を計算し，結果を表示します．",
)
# エントリーポイント
if __name__ == "__main__":
    interface.launch(server_name="0.0.0.0")
