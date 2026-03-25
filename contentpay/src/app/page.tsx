import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">ContentPay</h1>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 text-gray-600 hover:text-gray-900">
              登录
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              开始使用
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h2 className="text-5xl font-bold mb-6">
            5分钟搭建你的<br />付费内容站点
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            独立创作者的知识变现平台。支持文章、资源、会员订阅，
            数据自有，品牌自有，比自建网站快10倍。
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 text-lg"
            >
              立即开始
            </Link>
            <a
              href="#features"
              className="px-8 py-3 border rounded-lg hover:bg-gray-50 text-lg"
            >
              了解更多
            </a>
          </div>
        </section>

        <section id="features" className="bg-gray-50 py-24">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">核心功能</h3>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">📝</div>
                <h4 className="font-semibold mb-2">富文本编辑</h4>
                <p className="text-gray-600">支持 Markdown，高效创作</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">💳</div>
                <h4 className="font-semibold mb-2">Stripe 支付</h4>
                <p className="text-gray-600">一键接入，自动开票</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📈</div>
                <h4 className="font-semibold mb-2">收入看板</h4>
                <p className="text-gray-600">实时掌握订阅和收入</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-6">灵活的付费模式</h3>
            <div className="grid grid-cols-3 gap-8">
              <div className="p-6 border rounded-lg">
                <div className="text-2xl mb-4">完全付费</div>
                <p className="text-gray-600">标题可见，内容付费</p>
              </div>
              <div className="p-6 border rounded-lg">
                <div className="text-2xl mb-4">部分免费</div>
                <p className="text-gray-600">前30%免费预览</p>
              </div>
              <div className="p-6 border rounded-lg">
                <div className="text-2xl mb-4">会员专享</div>
                <p className="text-gray-600">仅订阅者可见</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500">
          ContentPay - 创作者付费内容平台
        </div>
      </footer>
    </div>
  );
}
