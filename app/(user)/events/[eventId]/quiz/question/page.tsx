import { getQuestionWithChoices } from "@/app/_lib/actions/user";
import { getQuizStatus } from "@/app/_lib/actions/user";
import { QuestionDisplay } from "./_components/QuestionDisplay";
import styles from "./page.module.css";

interface QuestionPageProps {
  params: Promise<{ eventId: string }>;
}

/**
 * クイズ問題表示ページ（Server Component）
 * - サーバーサイドで問題と選択肢を取得
 * - QuestionDisplay（Client Component）に渡す
 */
export default async function QuestionPage({ params }: QuestionPageProps) {
  const { eventId: eventIdStr } = await params;
  const eventId = parseInt(eventIdStr, 0);

  // クイズの状態を取得
  const statusResult = await getQuizStatus(eventId);
  if (!statusResult.success) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorTitle}>エラー</p>
        <p className={styles.errorMessage}>クイズ状態の取得に失敗しました</p>
      </div>
    );
  }

  // 問題と選択肢を取得
  const result = await getQuestionWithChoices({ eventId });

  if (!result.success) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorTitle}>エラー</p>
        <p className={styles.errorMessage}>
          {result.error || "問題の読み込みに失敗しました"}
        </p>
      </div>
    );
  }

  const { data } = result;

  return (
    <div className={styles.container}>
      <QuestionDisplay
        eventId={eventId}
        questionText={data.text}
        questionImageUrl={data.image_url}
        choices={data.choices.map(
          (choice: {
            id: number;
            text: string;
            image_url: string | null;
            order_num: number;
          }) => ({
            id: choice.id,
            text: choice.text,
            imageUrl: choice.image_url,
            orderNum: choice.order_num,
          })
        )}
      />
    </div>
  );
}
