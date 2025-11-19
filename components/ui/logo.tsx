export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20audiot-iq%20big%20without%20bg.png-bniajyeaf5TeQYtgypNyrGiDOKCyWl.png"
        alt="Audit-IQ Logo"
        className="h-12 w-auto"
      />
    </div>
  )
}
