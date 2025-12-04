# CSS Modules への変換プロンプト

## やること

- 指定されたコンポーネントとそのコンポーネントで参照している子や孫コンポーネントを CSS Modules を使う形に変換する

## 実装手順

### 1. ディレクトリ構造の変更

- コンポーネントを `ComponentName/` ディレクトリに移動
- `ComponentName/index.ts` でエクスポート
- `ComponentName/ComponentName.tsx` に実装を配置

### 2. CSS Modules ファイル作成

- `ComponentName.module.css` を同じディレクトリに作成
- Tailwind CSS のクラス名を対応する CSS にマッピング

### 3. TypeScript ファイル更新

```typescript
import styles from "./ComponentName.module.css";

// className="..." を className={styles.className} に置換
```

### 4. 古いファイルの削除

- 移動前の元のファイルがあれば削除

## CSS Modules への置換例

### Tailwind → CSS Modules

```
// Tailwind
className="flex flex-col items-center gap-4 p-6 bg-blue-50 rounded-lg"

// CSS Modules
className={styles.container}

/* styles.module.css */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: #eff6ff;
  border-radius: 0.5rem;
}
```

### アニメーション例

```css
.pulseDot {
  width: 4rem;
  height: 4rem;
  background-color: #2563eb;
  border-radius: 50%;
  opacity: 0.75;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

## ビルド検証

```bash
pnpm build
```
