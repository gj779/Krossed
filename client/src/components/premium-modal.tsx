import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Infinity, Zap, Star, Eye, RotateCcw } from "lucide-react";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export function PremiumModal({ isOpen, onClose, onUpgrade }: PremiumModalProps) {
  const features = [
    { icon: Infinity, text: "Unlimited daily swipes" },
    { icon: Zap, text: "5 Boosts per month" },
    { icon: Star, text: "Unlimited Super Likes" },
    { icon: Eye, text: "See who liked you" },
    { icon: RotateCcw, text: "Rewind last swipe" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl p-0 border-none overflow-hidden">
        {/* Header */}
        <div className="gradient-accent p-6 text-center">
          <Crown className="w-10 h-10 text-black mx-auto mb-3" />
          <h2 className="font-poppins font-bold text-xl text-black">
            Upgrade to Premium
          </h2>
          <p className="text-black/80 text-sm mt-1">
            Unlock unlimited possibilities
          </p>
        </div>

        {/* Features */}
        <div className="p-6 space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                <feature.icon className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="p-6 pt-0 space-y-3">
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-gray-900">
              $14.99<span className="text-sm font-normal text-gray-500">/month</span>
            </div>
            <div className="text-xs text-gray-500">Cancel anytime</div>
          </div>

          <Button
            onClick={onUpgrade}
            className="w-full gradient-accent text-black py-3 rounded-full font-bold text-lg hover:opacity-90 transition-all"
          >
            Upgrade Now
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-gray-500 py-2 font-medium"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
