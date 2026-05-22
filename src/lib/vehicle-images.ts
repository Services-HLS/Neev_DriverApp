/** Vehicle photo: public/vehicles/tiago-ev.jpg (from Tiago ev.jpg) */
export const DEFAULT_VEHICLE_IMAGE = "/vehicles/tiago-ev.jpg";

export const vehicleImageByKey: Record<string, string> = {
  "tata-xpres": DEFAULT_VEHICLE_IMAGE,
  "mg-zs": DEFAULT_VEHICLE_IMAGE,
  "tiago-ev": DEFAULT_VEHICLE_IMAGE,
};

export function resolveVehicleImageUrl(_imageKey?: string, _remoteUrl?: string): string {
  return DEFAULT_VEHICLE_IMAGE;
}
