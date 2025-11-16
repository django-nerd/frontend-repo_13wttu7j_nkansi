import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function TopicDetail() {
  const { id } = useParams()
  const [topic, setTopic] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/api/topics/${id}`)
      if (!res.ok) throw new Error('Gagal memuat topik')
      const data = await res.json()
      setTopic(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const currentStep = useMemo(() => topic?.steps?.[stepIndex] || null, [topic, stepIndex])

  const next = () => setStepIndex(i => Math.min(i + 1, (topic?.steps?.length || 1) - 1))
  const prev = () => setStepIndex(i => Math.max(i - 1, 0))

  const selectAnswer = (qIdx, optIdx) => {
    setAnswers(prev => {
      const copy = [...prev]
      copy[qIdx] = optIdx
      return copy
    })
  }

  const collectQuestions = () => {
    if (!topic) return []
    const qs = []
    topic.steps.forEach(s => {
      if (s.type === 'quiz') {
        (s.quiz_questions || []).forEach(q => qs.push(q))
      }
    })
    return qs
  }

  const submit = async () => {
    try {
      const payload = {
        topic_id: id,
        answers
      }
      const res = await fetch(`${API_BASE}/api/selftest/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Gagal mengirim jawaban')
      const data = await res.json()
      setResult(data)
      // pindah ke akhir
      setStepIndex((topic?.steps?.length || 1) - 1)
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <div className="p-6">Memuat...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!topic) return null

  const questions = collectQuestions()

  return (
    <div className="max-w-3xl mx-auto p-6">
      <a href="/" className="text-blue-600 hover:underline">← Kembali</a>
      <h1 className="text-3xl font-bold text-gray-900 mt-2">{topic.title}</h1>
      <p className="text-gray-600 mb-4">{topic.description}</p>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">Langkah {stepIndex + 1} dari {topic.steps.length}</span>
          <div className="space-x-2">
            <button onClick={prev} className="px-3 py-1 bg-gray-100 rounded" disabled={stepIndex===0}>Sebelumnya</button>
            <button onClick={next} className="px-3 py-1 bg-gray-800 text-white rounded" disabled={stepIndex===topic.steps.length-1}>Berikutnya</button>
          </div>
        </div>

        {currentStep?.type === 'theory' && (
          <div>
            <h3 className="text-xl font-semibold mb-2">{currentStep.title}</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{currentStep.content}</p>
          </div>
        )}

        {currentStep?.type === 'case' && (
          <div>
            <h3 className="text-xl font-semibold mb-2">{currentStep.title}</h3>
            <div className="p-4 bg-blue-50 rounded text-blue-900">{currentStep.case_prompt}</div>
          </div>
        )}

        {currentStep?.type === 'quiz' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">{currentStep.title}</h3>
            {questions.map((q, qi) => (
              <div key={qi} className="mb-6">
                <p className="font-medium">{qi + 1}. {q.question}</p>
                <div className="mt-2 space-y-2">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${answers[qi]===oi ? 'bg-blue-50 border-blue-300' : 'border-gray-200'}`}>
                      <input type="radio" name={`q-${qi}`} checked={answers[qi]===oi} onChange={() => selectAnswer(qi, oi)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
                {result && (
                  <div className={`mt-2 text-sm ${result.details[qi]?.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                    {result.details[qi]?.is_correct ? 'Benar' : 'Salah'}{result.details[qi]?.explanation ? ` — ${result.details[qi].explanation}` : ''}
                    <div className="text-gray-500">Level: {result.details[qi]?.hots_level}</div>
                  </div>
                )}
              </div>
            ))}

            {!result && (
              <button onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded">Kirim Jawaban</button>
            )}
          </div>
        )}

        {currentStep?.type === 'selftest' && (
          <div>
            <h3 className="text-xl font-semibold mb-2">{currentStep.title}</h3>
            {result ? (
              <div className="p-4 bg-green-50 rounded">
                <p className="text-green-800 font-semibold">Skor Anda: {result.score} ({result.correct}/{result.total} benar)</p>
              </div>
            ) : (
              <p className="text-gray-700">Lengkapi kuis lalu kirim jawaban untuk melihat hasil.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
