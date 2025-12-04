import Image from "next/image";
import styles from "./QuestionContent.module.css";

interface QuestionContentProps {
  text: string;
  imageUrl: string | null;
}

/**
 * 問題の内容（テキスト＋画像）を表示
 */
export function QuestionContent({ text, imageUrl }: QuestionContentProps) {
  return (
    <div className={styles.container}>
      {/* Q マーク付き問題テキスト */}
      <div className={styles.questionTextWrapper}>
        <div className={styles.questionMarkBadge}>
          <span className={styles.questionMarkText}>Q</span>
        </div>
        <p className={styles.questionText}>{text}</p>
      </div>

      {/* 問題画像 */}
      {imageUrl && (
        <div className={styles.imageContainer}>
          <Image
            src={imageUrl}
            alt="問題画像"
            fill
            className={styles.image}
            priority
          />
        </div>
      )}
    </div>
  );
}
