export default function Loading() {
  return (
    <main style={{ paddingTop: '96px', paddingBottom: '96px', paddingLeft: '16px', paddingRight: '16px', maxWidth: '1536px', margin: '0 auto', minHeight: '100vh' }}>
      <div className="mb-8 flex flex-col gap-2">
        <div className="h-10 w-48 bg-[#1d2025] rounded animate-pulse" />
        <div className="h-4 w-32 bg-[#1d2025] rounded animate-pulse" />
      </div>

      <div className="space-y-6">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="flex items-center justify-between border-b border-[#46484d]/10 pb-2 mb-4">
              <div className="h-7 w-24 bg-[#1d2025] rounded animate-pulse" />
              <div className="h-4 w-20 bg-[#1d2025] rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[0, 1, 2].map((j) => (
                <div key={j} className="bg-[#111318] p-4 rounded-xl border border-[#46484d]/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        <div className="w-12 h-12 rounded-full bg-[#1d2025] animate-pulse" />
                        <div className="w-12 h-12 rounded-full bg-[#23262c] animate-pulse" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="h-4 w-28 bg-[#1d2025] rounded animate-pulse" />
                        <div className="h-3 w-20 bg-[#1d2025] rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-[#1d2025] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
