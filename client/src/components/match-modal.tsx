import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  matchedUser: User;
  onSendMessage: () => void;
  onKeepSwiping: () => void;
}

export function MatchModal({
  isOpen,
  onClose,
  currentUser,
  matchedUser,
  onSendMessage,
  onKeepSwiping,
}: MatchModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto rounded-3xl p-8 text-center border-none">
        {/* Celebration */}
        <div className="relative mb-6">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="font-poppins font-bold text-2xl text-gradient mb-2">
            It's a Match!
          </h2>
          <p className="text-gray-600 text-sm">
            You and {matchedUser.name} liked each other
          </p>
        </div>

        {/* User photos */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary">
            <img
              src={currentUser.profilePhoto || "https://via.placeholder.com/100"}
              alt="You"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-2xl">💕</div>
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-secondary">
            <img
              src={matchedUser.profilePhoto || "https://via.placeholder.com/100"}
              alt={matchedUser.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button 
            onClick={onSendMessage}
            className="w-full gradient-primary text-white py-3 rounded-full font-medium hover:opacity-90 transition-all"
          >
            Send Message
          </Button>
          <Button
            onClick={onKeepSwiping}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 py-3 rounded-full font-medium hover:bg-gray-50 transition-all"
          >
            Keep Swiping
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
