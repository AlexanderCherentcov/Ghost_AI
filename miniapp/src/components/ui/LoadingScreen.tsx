export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0A0014]">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">👻</div>
        <div className="text-yellow-400 font-bold text-xl">Ghost AI</div>
        <div className="text-gray-500 text-sm mt-2">Загрузка...</div>
      </div>
    </div>
  )
}
