import dynamic from 'next/dynamic'

const AIAssistant = dynamic(() => import('@/components/ai-assistant'), {
  ssr: false,
})

export default function AIAssistPage() {
  return <AIAssistant />
}
