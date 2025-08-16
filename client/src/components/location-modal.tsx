import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnableLocation: () => void;
  onManualLocation: () => void;
}

export function LocationModal({
  isOpen,
  onClose,
  onEnableLocation,
  onManualLocation,
}: LocationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl p-8 text-center border-none">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="font-poppins font-bold text-xl text-gray-900 mb-3">
          Enable Location
        </h2>
        
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          We need your location to show you people nearby. Your location is only used for 
          matching and is never shared with other users.
        </p>
        
        <div className="space-y-3">
          <Button
            onClick={onEnableLocation}
            className="w-full gradient-primary text-white py-3 rounded-full font-medium hover:opacity-90 transition-all"
          >
            Enable Location
          </Button>
          <Button
            onClick={onManualLocation}
            variant="ghost"
            className="w-full text-gray-500 py-2 font-medium"
          >
            Enter Location Manually
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
