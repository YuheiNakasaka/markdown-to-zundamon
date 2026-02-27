# characters/

キャラクター画像の配置ディレクトリです。

## ディレクトリ構成

キャラクター名のフォルダを作成し、その中に画像を配置してください。

```
characters/
├── ずんだもん/
│   ├── default.png            # 必須: 立ち絵（通常時）
│   ├── default_active1.png    # 任意: 口パク用（口開き）
│   └── default_active2.png    # 任意: 口パク用（口閉じ or 別パターン）
├── 四国めたん/
│   ├── default.png
│   ├── default_active1.png
│   └── default_active2.png
└── ...
```

## 画像ファイル

| ファイル名 | 必須 | 説明 |
|-----------|------|------|
| `default.png` | 必須 | 通常時の立ち絵。発話していないときに表示されます。 |
| `default_active1.png` | 任意 | 口パクアニメーション用フレーム1。 |
| `default_active2.png` | 任意 | 口パクアニメーション用フレーム2。 |

- `default_active*.png` が存在する場合、発話中にフレームを交互に切り替えて口パクアニメーションが再生されます。
- `default_active*.png` がない場合、発話中も `default.png` が表示されます。

## Markdown 側の設定

Markdown の frontmatter でキャラクターを登録すると使えるようになります。`name` はここのフォルダ名と一致させてください。

```yaml
---
characters:
  - name: ずんだもん
    speakerId: 3
  - name: 四国めたん
    speakerId: 2
---
```

`speakerId` は VOICEVOX の話者 ID です。VOICEVOX の API (`GET /speakers`) で確認できます。
