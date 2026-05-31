/**
 * PublicFooter.tsx — Footer cho các trang public.
 *
 * Hiển thị: Logo + description, quick links, copyright.
 * Đơn giản, clean, responsive.
 */
export default function PublicFooter() {
  return (
    <footer className="bg-zinc-900 text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏪</span>
              <span className="text-lg font-bold text-white">Bizflow</span>
            </div>
            <p className="text-sm leading-relaxed">
              Nền tảng hỗ trợ chuyển đổi số cho hộ kinh doanh truyền thống.
              Quản lý bán hàng, kho, công nợ dễ dàng hơn bao giờ hết.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Liên kết
            </h3>
            <ul className="space-y-2">
              {['Trang chủ', 'Giới thiệu', 'Liên hệ'].map((link) => (
                <li key={link}>
                  <a
                    href={link === 'Trang chủ' ? '/' : `/${link.toLowerCase()}`}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Liên hệ
            </h3>
            <ul className="space-y-2 text-sm">
              <li>Email: contact@bizflow.vn</li>
              <li>Phone: 1900 1234</li>
              <li>Địa chỉ: TP. Hồ Chí Minh</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-zinc-800 text-center text-sm">
          &copy; {new Date().getFullYear()} Bizflow. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
