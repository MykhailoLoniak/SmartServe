type LoaderProps = {
  fullScreen?: boolean;
  text?: string;
};

export default function Loader({
  fullScreen = false,
  text = 'Loading...',
}: LoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 w-full ${fullScreen ? 'min-h-screen' : 'min-h-[120px]'
        }`}
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}