import styles from "./page.module.css";

interface QuestionReadingPageProps {
  params: Promise<{ eventId: string }>;
}

/**
 * 問題読み上げページ
 * 背景のみ表示（問題内容は表示しない）
 */
export default async function QuestionReadingPage({
  params,
}: QuestionReadingPageProps) {
  // paramsを読み取るだけ（使用しない）
  await params;

  return <div className={styles.container} />;
}
