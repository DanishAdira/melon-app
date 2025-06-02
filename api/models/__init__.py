import torch
from .unet import UNet

def create_model(params: dict):
    """
    モデル名に応じたモデルを作成し，パラメータを辞書として渡す関数

    Parameters:
    model_name (str): 使用するモデルの名前
    params (dict): モデルのパラメータ

    Returns:
    model: モデル
    """

    # デバイスの設定
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    # モデル名
    model_name = params["name"]

    # Unet (Segmentation Models Pytorchを用いた実装)
    if model_name == "UNet":
        unet_params = {
            "encoder_name": params["encoder_name"],
        }
        return UNet(**unet_params).to(device)
    else:
        raise ValueError(f"Unsupported model: {model_name}")