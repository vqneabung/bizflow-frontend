/**
 * Contact page — Trang liên hệ Bizflow.
 *
 * Hiển thị: thông tin liên hệ (email, phone, địa chỉ) + form liên hệ tĩnh.
 * Form chưa gửi được — sẽ kết nối API sau.
 */
export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact info */}
        <section className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900">
              Liên hệ
            </h1>
            <p className="text-lg text-zinc-600">
              Bạn có câu hỏi? Chúng tôi luôn sẵn sàng hỗ trợ.
            </p>
          </div>

          <div className="space-y-6">
            {[
              { icon: '📧', label: 'Email', value: 'contact@bizflow.vn' },
              { icon: '📞', label: 'Điện thoại', value: '1900 1234' },
              { icon: '📍', label: 'Địa chỉ', value: 'TP. Hồ Chí Minh, Việt Nam' },
              { icon: '🕐', label: 'Giờ làm việc', value: 'Thứ 2 - Thứ 7, 8:00 - 17:30' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-sm text-zinc-500">{item.label}</p>
                  <p className="text-base font-medium text-zinc-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact form */}
        <section className="bg-zinc-50 rounded-xl border border-zinc-200 p-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-6">
            Gửi tin nhắn cho chúng tôi
          </h2>

          <form className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Họ và tên
              </label>
              <input
                id="name"
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Nội dung
              </label>
              <textarea
                id="message"
                rows={4}
                placeholder="Nhập tin nhắn của bạn..."
                className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
              />
            </div>

            <button
              type="button"
              className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 transition-colors"
            >
              Gửi tin nhắn
            </button>

            <p className="text-xs text-zinc-400 text-center">
              * Form liên hệ sẽ được kết nối API trong phiên bản tiếp theo.
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}
