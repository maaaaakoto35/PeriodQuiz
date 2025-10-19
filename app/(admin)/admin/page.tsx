export default function AdminDashboard() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          ダッシュボード
        </h2>
        <p className="text-gray-600">PeriodQuizの管理画面へようこそ</p>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-blue-900 truncate">
                イベント管理
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">
                準備中
              </dd>
            </div>
          </div>
          <div className="bg-green-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-green-900 truncate">
                問題管理
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                準備中
              </dd>
            </div>
          </div>
          <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-purple-900 truncate">
                進行制御
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-purple-600">
                準備中
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
