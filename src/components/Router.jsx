import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from '../App'
import Test from '../Test'
import TopicDetail from './TopicDetail'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/test" element={<Test />} />
        <Route path="/topics/:id" element={<TopicDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
