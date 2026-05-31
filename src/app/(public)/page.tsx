/**
 * Landing page — Trang chủ Bizflow.
 *
 * Sections:
 * 1. Hero: Headline + subtext + CTA buttons
 * 2. Features: 4 tính năng chính
 * 3. How it works: 3 bước đơn giản
 * 4. CTA: Kêu gọi đăng ký
 *
 * Chưa có auth: tất cả đều public.
 */
import Link from 'next/link'

const features = [
  {
    icon: '📦',
    title: 'Quản lý bán hàng',
    desc: 'Tạo đơn hàng nhanh chóng, tìm kiếm sản phẩm tức thì, hỗ trợ bán tại quầy và đặt hàng qua điện thoại.',
  },
  {
    icon: '📊',
    title: 'Quản lý kho',
    desc: 'Theo dõi tồn kho real-time, tự động trừ khi bán hàng, cảnh báo hàng sắp hết.',
  },
  {
    icon: '📋',
    title: 'Quản lý công nợ',
    desc: 'Ghi nhận công nợ tự động khi bán chịu, theo dõi lịch sử thanh toán của từng khách hàng.',
  },
  {
    icon: '🤖',
    title: 'AI hỗ trợ',
    desc: 'Trợ lý AI hiểu giọng nói tự nhiên, tự động tạo đơn nháp và đề xuất thông minh.',
  },
]

const steps = [
  { step: '1', title: 'Đăng ký tài khoản', desc: 'Tạo tài khoản miễn phí trong 2 phút. Không cần thẻ tín dụng.' },
  { step: '2', title: 'Thiết lập cửa hàng', desc: 'Nhập sản phẩm, giá, tồn kho. Dễ dàng như Excel.' },
  { step: '3', title: 'Bắt đầu bán hàng', desc: 'Tạo đơn, theo dõi doanh thu, quản lý công nợ ngay lập tức.' },
]

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 tracking-tight leading-tight">
              Chuyển đổi số cho{' '}
              <span className="text-brand-600">hộ kinh doanh</span>
            </h1>
            <p className="text-lg sm:text-xl text-zinc-600 leading-relaxed max-w-2xl mx-auto">
              Quản lý bán hàng, kho hàng, công nợ và báo cáo tài chính — tất cả trong một nền tảng.
              Đơn giản, thông minh, dành riêng cho hộ kinh doanh Việt Nam.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-base hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/25"
              >
                Bắt đầu miễn phí
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-8 py-3.5 rounded-xl border border-zinc-300 text-zinc-700 font-semibold text-base hover:bg-zinc-50 transition-colors"
              >
                Tìm hiểu thêm
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative gradient blob */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-brand-200/10 blur-3xl pointer-events-none" />
      </section>

      {/* ── Features ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900">
              Tại sao chọn Bizflow?
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Được thiết kế dành riêng cho hộ kinh doanh truyền thống — không rườm rà, không thiết bị đắt tiền.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl border border-zinc-200 p-6 hover:shadow-lg hover:border-brand-200 transition-all duration-200"
              >
                <span className="text-3xl block mb-4">{feature.icon}</span>
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 sm:py-28 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900">
              Bắt đầu chỉ với 3 bước
            </h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
              Không cần cài đặt phức tạp. Không cần thiết bị đắt tiền. Chỉ cần một chiếc điện thoại.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((s) => (
              <div key={s.step} className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-brand-600 text-white text-2xl font-bold flex items-center justify-center mx-auto shadow-lg shadow-brand-600/20">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">{s.title}</h3>
                <p className="text-sm text-zinc-600 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 sm:py-28 bg-gradient-to-r from-brand-600 to-brand-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Sẵn sàng chuyển đổi số?
          </h2>
          <p className="text-lg text-brand-100 max-w-2xl mx-auto">
            Hàng ngàn hộ kinh doanh đã tin dùng. Tham gia cùng chúng tôi ngay hôm nay.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center px-10 py-4 rounded-xl bg-white text-brand-700 font-semibold text-lg hover:bg-brand-50 transition-colors shadow-xl"
          >
            Đăng ký miễn phí
          </Link>
        </div>
      </section>
    </>
  )
}
