export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0c0e12', color: '#f6f6fc' }}>
      {children}
    </div>
  )
}