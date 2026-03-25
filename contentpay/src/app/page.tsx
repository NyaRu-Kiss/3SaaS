import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">ContentPay</h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h2 className="text-5xl font-bold mb-6 text-gray-900">
            Build Your Paid Content Site<br />in 5 Minutes
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            The creator platform for monetizing knowledge. Support articles,
            resources, and membership subscriptions. Own your data and brand,
            deploy 10x faster than building your own website.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-lg font-medium"
            >
              Start Free
            </Link>
            <a
              href="#features"
              className="px-8 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-lg font-medium text-gray-700"
            >
              Learn More
            </a>
          </div>
        </section>

        <section id="features" className="bg-gray-50 py-24 border-y border-gray-200">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Core Features
            </h3>
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
                <div className="text-4xl mb-4">📝</div>
                <h4 className="font-semibold mb-2 text-gray-900">
                  Rich Text Editor
                </h4>
                <p className="text-gray-600">
                  Markdown support for efficient writing
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
                <div className="text-4xl mb-4">💳</div>
                <h4 className="font-semibold mb-2 text-gray-900">
                  Stripe Payments
                </h4>
                <p className="text-gray-600">
                  One-click integration, auto invoicing
                </p>
              </div>
              <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
                <div className="text-4xl mb-4">📈</div>
                <h4 className="font-semibold mb-2 text-gray-900">
                  Revenue Dashboard
                </h4>
                <p className="text-gray-600">
                  Track subscriptions and earnings
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-12 text-gray-900">
              Flexible Pricing Models
            </h3>
            <div className="grid grid-cols-3 gap-8">
              <div className="p-6 border-2 border-gray-200 rounded-xl">
                <div className="text-2xl font-bold mb-4 text-gray-900">
                  Pay per Article
                </div>
                <p className="text-gray-600">
                  Title visible, pay to unlock content
                </p>
              </div>
              <div className="p-6 border-2 border-gray-200 rounded-xl">
                <div className="text-2xl font-bold mb-4 text-gray-900">
                  Free Preview
                </div>
                <p className="text-gray-600">
                  First 30% free, pay for the rest
                </p>
              </div>
              <div className="p-6 border-2 border-gray-200 rounded-xl">
                <div className="text-2xl font-bold mb-4 text-gray-900">
                  Members Only
                </div>
                <p className="text-gray-600">
                  Subscribers only content
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-600">
          ContentPay - Creator Paid Content Platform
        </div>
      </footer>
    </div>
  );
}
