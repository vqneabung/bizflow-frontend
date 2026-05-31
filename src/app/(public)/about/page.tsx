/**
 * About page — Giới thiệu về Bizflow platform.
 *
 * Nội dung: Sứ mệnh, giải pháp, công nghệ sử dụng.
 * Dựa trên SRS document của dự án SP26SE030.
 */
export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-16">
      {/* Mission */}
      <section className="space-y-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900">
          Về Bizflow
        </h1>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Bizflow là nền tảng chuyển đổi số được thiết kế dành riêng cho hộ kinh doanh
          truyền thống tại Việt Nam — đặc biệt là các cửa hàng vật liệu xây dựng, tạp hóa,
          và các ngành hàng nhóm 1, nhóm 2 theo Quyết định 3389/QĐ-BTC (2025).
        </p>
        <p className="text-lg text-zinc-600 leading-relaxed">
          Theo khảo sát, phần lớn hộ kinh doanh vẫn vận hành hoàn toàn thủ công — ghi chép
          sổ tay, quản lý bằng Excel. Họ thiếu thiết bị (máy tính, máy in hóa đơn, máy quét mã vạch)
          và ngân sách để thuê kế toán. Bizflow ra đời để giải quyết vấn đề đó.
        </p>
      </section>

      {/* Solution */}
      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          Giải pháp của chúng tôi
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { title: 'Bán hàng đa kênh', desc: 'Hỗ trợ bán tại quầy, đặt hàng qua điện thoại/Zalo, và đơn hàng từ AI.' },
            { title: 'Quản lý công nợ', desc: 'Tự động ghi nhận công nợ, theo dõi lịch sử giao dịch dài hạn.' },
            { title: 'Báo cáo tài chính', desc: 'Tự động lập báo cáo theo Thông tư 88/2021/TT-BTC, sẵn sàng cho thuế.' },
            { title: 'AI thông minh', desc: 'Trợ lý AI hiểu ngôn ngữ tự nhiên, tự động tạo đơn nháp từ giọng nói hoặc văn bản.' },
          ].map((item) => (
            <div key={item.title} className="bg-zinc-50 rounded-xl p-6 border border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
          Công nghệ sử dụng
        </h2>
        <div className="flex flex-wrap gap-3">
          {['Spring Boot', 'Next.js', 'React', 'Laravel', 'SQL Server', 'Redis', 'Python', 'AI/LLM'].map((tech) => (
            <span key={tech} className="px-4 py-2 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium border border-brand-200">
              {tech}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
