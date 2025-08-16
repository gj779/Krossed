import { useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QRCodeProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  profileUrl: string;
  userName: string;
}

export function QRCode({ isOpen, onOpenChange, profileUrl, userName }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      generateQRCode();
    }
  }, [isOpen, profileUrl]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      // Use a free QR code generation service
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}&format=png&margin=10`;
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        
        // Set canvas size
        canvas.width = 350;
        canvas.height = 400;
        
        // Clear canvas with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#fdf2f8');
        gradient.addColorStop(1, '#f3e8ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add border
        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 3;
        ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
        
        // Add title
        ctx.fillStyle = '#1f2937';
        ctx.font = 'bold 20px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Krossed Profile', canvas.width / 2, 50);
        
        // Add subtitle
        ctx.font = '16px system-ui';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(`${userName}'s Profile`, canvas.width / 2, 75);
        
        // Draw QR code
        ctx.drawImage(img, 25, 95, 300, 300);
        
        // Add footer
        ctx.font = '14px system-ui';
        ctx.fillStyle = '#9ca3af';
        ctx.fillText('Scan to view profile', canvas.width / 2, 425);
      };
      
      img.onerror = () => {
        // Fallback: draw a simple placeholder
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        canvas.width = 350;
        canvas.height = 400;
        
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#6b7280';
        ctx.font = '16px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code Generation', canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText('Temporarily Unavailable', canvas.width / 2, canvas.height / 2 + 15);
      };
      
      img.src = qrApiUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!canvasRef.current) return;

    try {
      const link = document.createElement('a');
      link.download = `${userName}-krossed-profile-qr.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
      
      toast({
        title: "QR Code Downloaded",
        description: "QR code saved to your downloads folder",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download QR code",
        variant: "destructive",
      });
    }
  };

  const shareQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;

        if (navigator.share && navigator.canShare) {
          const file = new File([blob], `${userName}-profile-qr.png`, { type: 'image/png' });
          
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${userName}'s Krossed Profile`,
              text: 'Check out my dating profile on Krossed!',
              files: [file]
            });
            return;
          }
        }

        // Fallback: copy to clipboard
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        
        toast({
          title: "QR Code Copied",
          description: "QR code copied to clipboard",
        });
      });
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Unable to share QR code",
        variant: "destructive",
      });
    }
  };

  const copyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "Link Copied",
        description: "Profile link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Share QR Code</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          <canvas
            ref={canvasRef}
            className="border rounded-lg mx-auto shadow-lg"
            data-testid="canvas-qr-code"
          />

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Share this QR code for others to quickly access your profile
            </p>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadQRCode}
                className="flex-1"
                data-testid="button-download-qr"
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={shareQRCode}
                className="flex-1"
                data-testid="button-share-qr"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={copyProfileLink}
              className="w-full text-xs"
              data-testid="button-copy-profile-link"
            >
              <Copy className="w-3 h-3 mr-1" />
              Copy Profile Link Instead
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}