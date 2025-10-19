export default function UserPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          PeriodQuiz
        </h1>
        <p className="text-center text-gray-600 mb-8">
          ピリオドごとにチャンピオンが決まる
          <br />
          リアルタイムクイズシステム
        </p>
        <form className="space-y-4">
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              ニックネーム
            </label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ニックネームを入力してください"
              maxLength={20}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
          >
            参加する
          </button>
        </form>
      </div>
    </div>
  );
}
