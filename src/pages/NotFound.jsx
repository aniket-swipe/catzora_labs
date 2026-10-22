import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { EmptyState } from "../components/ui/index.js";

export function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <EmptyState
        icon={Compass}
        title="That page doesn't exist"
        description="The link may be out of date, or the page may have moved."
        action={
          <Link to="/app" className="text-[13px] font-medium text-accent hover:underline">
            Back to the dashboard
          </Link>
        }
      />
    </div>
  );
}
