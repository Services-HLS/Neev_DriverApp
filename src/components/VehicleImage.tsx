import { useState } from "react";
import { Car } from "lucide-react";
import type { AssignedVehicle } from "@/lib/data";
import { DEFAULT_VEHICLE_IMAGE, resolveVehicleImageUrl } from "@/lib/vehicle-images";

/** Source aspect ratio of public/vehicles/tiago-ev.jpg (295×171) */
const VEHICLE_ASPECT = "295 / 171";

export function VehicleImage({
  vehicle,
  className = "",
  compact = false,
  showLabel = true,
  animate = false,
}: {
  vehicle: Pick<AssignedVehicle, "image" | "imageUrl" | "model" | "reg">;
  className?: string;
  compact?: boolean;
  showLabel?: boolean;
  animate?: boolean;
}) {
  const primary = resolveVehicleImageUrl(vehicle.image, vehicle.imageUrl);
  const [src, setSrc] = useState(primary);
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/30 bg-white shadow-sm ${
        compact ? "w-full" : "w-full max-w-md"
      } ${animate ? "animate-eco-float" : ""} ${className}`}
      style={{ aspectRatio: VEHICLE_ASPECT }}
    >
      {!failed ? (
        <img
          src={src}
          alt={`${vehicle.model} · ${vehicle.reg}`}
          className="absolute inset-0 w-full h-full object-contain object-center p-2"
          width={295}
          height={171}
          loading="eager"
          decoding="async"
          onError={() => {
            if (src !== DEFAULT_VEHICLE_IMAGE) {
              setSrc(DEFAULT_VEHICLE_IMAGE);
              return;
            }
            setFailed(true);
          }}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-muted text-muted-foreground">
          <Car className="size-10 opacity-60" />
        </div>
      )}
      {showLabel && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent pt-6 pb-1.5 px-2 pointer-events-none">
          <div className="text-[10px] font-medium text-white truncate">{vehicle.model}</div>
        </div>
      )}
    </div>
  );
}
