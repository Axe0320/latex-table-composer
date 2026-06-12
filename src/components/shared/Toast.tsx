interface ToastProps {
  message: string
  visible: boolean
}

export function Toast({ message, visible }: ToastProps) {
  if (!visible) return null
  return (
    <div
      className="fixed bottom-8 right-8 px-4 py-2.5 text-sm font-medium text-white rounded-md"
      style={{ background: 'var(--toast-bg)', boxShadow: 'var(--shadow-lg)' }}
    >
      {message}
    </div>
  )
}
