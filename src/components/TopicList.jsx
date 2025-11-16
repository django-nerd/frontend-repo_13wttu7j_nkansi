import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function TopicList() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [seeding, setSeeding] = useState(false)

  const loadTopics = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/topics`)
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const data = await res.json()
      setTopics(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTopics()
  }, [])

  const seedSample = async () => {
    try {
      setSeeding(true)
      const res = await fetch(`${API_BASE}/api/seed`, { method: 'POST' })
      if (!res.ok) throw new Error('Gagal membuat contoh topik')
      await loadTopics()
    } catch (e) {
      setError(e.message)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Microlearning</h1>
          <p className="text-gray-600">Belajar singkat berbasis langkah: teori, studi kasus, kuis HOTS, dan self-test.</p>
        </div>
        <a href="/test" className="text-sm text-blue-600 hover:underline">Cek Koneksi</a>
      </div>

      {loading && (
        <div className="bg-white rounded-lg p-6 shadow">Memuat topik...</div>
      )}

      {!loading && error && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      {!loading && topics.length === 0 && (
        <div className="bg-white rounded-lg p-6 shadow flex items-center justify-between">
          <div>
            <p className="text-gray-700">Belum ada topik. Buat contoh topik untuk mulai mencoba.</p>
          </div>
          <button onClick={seedSample} disabled={seeding} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {seeding ? 'Membuat...' : 'Buat Contoh'}
          </button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {topics.map(t => (
          <a key={t.id} href={`/topics/${t.id}`} className="block bg-white rounded-lg p-6 shadow hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t.title}</h3>
            <p className="text-gray-600 mb-3 line-clamp-2">{t.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{t.steps_count} langkah</span>
              <span>~{t.estimated_minutes} menit</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
