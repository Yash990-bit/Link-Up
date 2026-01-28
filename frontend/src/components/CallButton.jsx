import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <div className="flex items-center">
      <button onClick={handleVideoCall} className="btn btn-success btn-sm btn-circle text-white shadow-md hover:scale-105 transition-transform">
        <VideoIcon className="size-5" />
      </button>
    </div>
  );
}

export default CallButton;