import { Activity } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 group outline-none focus-visible:ring-2 focus-visible:ring-border rounded-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition-transform group-hover:scale-105">
        <Activity className="h-6 w-6" />
      </div>
      <span className="text-xl font-semibold tracking-tight text-white">
        CareFlow
      </span>
    </Link>
  );
}
