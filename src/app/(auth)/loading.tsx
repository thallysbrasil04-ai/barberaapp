export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
      <div className="w-full max-w-md animate-pulse space-y-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-neutral-200 rounded-xl" />
        </div>
        <div className="h-8 bg-neutral-200 rounded w-40 mx-auto" />
        <div className="h-64 bg-neutral-200 rounded-xl" />
      </div>
    </div>
  );
}
