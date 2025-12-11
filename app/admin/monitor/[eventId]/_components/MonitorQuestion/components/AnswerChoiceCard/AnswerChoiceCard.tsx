import styles from "./AnswerChoiceCard.module.css";

interface AnswerChoiceCardProps {
  choiceIndex: number;
  choiceText: string;
  choiceImageUrl: string | null;
  selectionCount: number | null;
  isCorrect: boolean;
  rowIndex: number;
  answerText?: string | null;
}

/**
 * モニター画面 - 正解発表の選択肢カード
 */
export function AnswerChoiceCard({
  choiceIndex,
  choiceText,
  choiceImageUrl,
  selectionCount,
  isCorrect,
  rowIndex,
  answerText,
}: AnswerChoiceCardProps) {
  // 正解発表時で answerText がある場合はそれを使用、なければ通常の choiceText
  const displayText = answerText || choiceText;

  const getBadgeGradient = () => {
    switch (choiceIndex) {
      case 0:
        return "bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#0088FF_0%,_#005299_100%)]";
      case 1:
        return "bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#FF2D55_0%,_#991B33_100%)]";
      case 2:
        return "bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#34C759_0%,_#19612B_100%)]";
      case 3:
        return "bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#FF8D28_0%,_#995518_100%)]";
      default:
        break;
    }
  };

  return (
    <div
      className={
        choiceImageUrl ? styles.rootWithImage : styles.rootWithoutImage
      }
    >
      {choiceImageUrl && (
        <div className={styles.imageContainer}>
          <img
            className="w-80 h-50 object-contain rounded-xl"
            src={choiceImageUrl}
            alt={`Choice ${choiceIndex + 1}`}
          />
        </div>
      )}

      <div
        className={`w-80 min-h-20 h-full rounded-xl shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] outline outline-1 outline-offset-[-1px] outline-sky-500 flex justify-center items-center gap-2.5 ${
          isCorrect ? "relative" : ""
        } ${!isCorrect && "bg-gradient-to-b from-black/10 to-blue-700/60"}`}
      >
        {/* 正解時の2層背景 */}
        {isCorrect && (
          <>
            {/* 下層: 不正解の色 */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-blue-700/60 rounded-xl" />
            {/* 上層: 正解の色（点滅アニメーション） */}
            <div
              className={`${styles.correctBlink} absolute inset-0 bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#FF2D55_0%,_#FF5374_100%)] rounded-xl`}
            />
          </>
        )}

        {/* コンテンツ */}
        <div
          className={
            isCorrect
              ? "relative z-10 flex justify-center items-center gap-2.5"
              : "contents"
          }
        >
          {/* 番号バッジ */}
          <div
            className={`w-10 px-5 py-[3px] rounded-[40px] outline outline-[0.50px] outline-offset-[-0.50px] outline-black flex justify-center items-center gap-2.5 overflow-hidden ${getBadgeGradient()}`}
          >
            <div className="text-center justify-center text-white text-3xl font-medium font-['Inter'] leading-8">
              {choiceIndex + 1}
            </div>
          </div>

          {/* テキスト */}
          <div className="w-48 p-2.5 flex justify-start items-start gap-2.5 overflow-hidden">
            <div
              className={`text-center justify-center text-3xl font-medium font-['Inter'] leading-8 ${
                isCorrect ? "text-amber-400" : "text-white"
              }`}
            >
              {displayText}
            </div>
          </div>

          {/* 選択人数 */}
          {selectionCount !== null && (
            <div
              className={`w-14 h-10 px-7 rounded-xl flex justify-center items-center gap-2.5 overflow-hidden ${
                isCorrect
                  ? "bg-gradient-to-l from-amber-400 to-orange-400"
                  : "bg-gradient-to-l from-white to-cyan-500"
              }`}
            >
              <div
                className={`text-center justify-center text-3xl font-medium font-['Inter'] leading-8 ${
                  isCorrect ? "text-red-500" : "text-blue-700"
                }`}
              >
                {selectionCount}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
