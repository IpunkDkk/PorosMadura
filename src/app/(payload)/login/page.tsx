import PasswordInput from '@/components/auth/PasswordInput'

export default async function LoginPage() {
  return (
    <div className="min-h-screen bg-poros-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="bg-poros-red text-white font-heading font-bold text-3xl w-10 h-10 flex items-center justify-center rounded">
                P
              </span>
              <h1 className="font-heading font-black text-2xl text-poros-navy">
                Poros<span className="text-poros-red">Madura</span>
              </h1>
            </div>
            <p className="text-sm text-gray-500 font-medium">CMS &mdash; Masuk ke Dashboard</p>
          </div>

          <form action="/api/auth/login" method="POST" className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-poros-red focus:border-transparent outline-none"
                placeholder="admin@porosmadura.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <PasswordInput name="password" placeholder="••••••••" />
            </div>
            <button
              type="submit"
              className="w-full bg-poros-red hover:bg-red-700 text-white font-bold py-2.5 rounded-lg transition-colors"
            >
              Masuk
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
