import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Share2, Instagram, Twitter, Facebook, MessageCircle, Copy, QrCode, Link2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QRCode } from "@/components/qr-code";
import type { User } from "@shared/schema";

interface SocialShareProps {
  user: User;
  className?: string;
}

interface ShareTemplate {
  platform: string;
  icon: any;
  color: string;
  template: string;
  urlPattern: string;
}

export function SocialShare({ user, className = "" }: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const { toast } = useToast();

  // Generate profile URL for sharing
  const profileUrl = `${window.location.origin}/profile/${user.id}`;
  
  // Default share message
  const defaultMessage = `Check out my Krossed dating profile! Looking for genuine connections nearby. 💫 #Krossed #Dating #LocalConnections`;

  const shareTemplates: ShareTemplate[] = [
    {
      platform: "Twitter",
      icon: Twitter,
      color: "bg-blue-500 hover:bg-blue-600",
      template: `${customMessage || defaultMessage}\n\n${profileUrl}`,
      urlPattern: `https://twitter.com/intent/tweet?text=${encodeURIComponent(customMessage || defaultMessage)}&url=${encodeURIComponent(profileUrl)}`
    },
    {
      platform: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      template: `${customMessage || defaultMessage}`,
      urlPattern: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}&quote=${encodeURIComponent(customMessage || defaultMessage)}`
    },
    {
      platform: "Instagram",
      icon: Instagram,
      color: "bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
      template: `${customMessage || defaultMessage}`,
      urlPattern: "" // Instagram doesn't support direct URL sharing
    },
    {
      platform: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      template: `${customMessage || defaultMessage}\n\n${profileUrl}`,
      urlPattern: `https://wa.me/?text=${encodeURIComponent((customMessage || defaultMessage) + '\n\n' + profileUrl)}`
    }
  ];

  const handleShare = async (template: ShareTemplate) => {
    if (template.platform === "Instagram") {
      // Instagram requires manual sharing
      await copyToClipboard(template.template + '\n\n' + profileUrl);
      toast({
        title: "Content Copied!",
        description: "Share content copied to clipboard. Paste it in your Instagram story or post.",
      });
      return;
    }

    if (template.urlPattern) {
      window.open(template.urlPattern, '_blank', 'width=600,height=400');
      toast({
        title: "Share Window Opened",
        description: `Sharing your profile on ${template.platform}`,
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: "Share content copied successfully!",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the text below.",
        variant: "destructive",
      });
    }
  };

  const copyProfileLink = async () => {
    await copyToClipboard(profileUrl);
  };

  const showQRCodeDialog = () => {
    setShowQRCode(true);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`${className} flex items-center space-x-2`}
          data-testid="button-social-share"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Profile</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Profile</DialogTitle>
          <DialogDescription>
            Increase your visibility by sharing your Krossed profile on social media
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Profile Preview */}
          <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-sm text-gray-600">Looking for genuine connections</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    Krossed Profile
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="custom-message">Customize Your Message</Label>
            <Textarea
              id="custom-message"
              placeholder={defaultMessage}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="min-h-[80px]"
              maxLength={280}
              data-testid="textarea-custom-message"
            />
            <p className="text-xs text-gray-500">
              {(customMessage || defaultMessage).length}/280 characters
            </p>
          </div>

          {/* Social Media Platforms */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Share On:</h4>
            <div className="grid grid-cols-2 gap-2">
              {shareTemplates.map((template) => (
                <Button
                  key={template.platform}
                  onClick={() => handleShare(template)}
                  className={`${template.color} text-white border-0 flex items-center space-x-2 py-2`}
                  data-testid={`button-share-${template.platform.toLowerCase()}`}
                >
                  <template.icon className="w-4 h-4" />
                  <span className="text-sm">{template.platform}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-2 pt-2 border-t">
            <h4 className="font-medium text-sm">Other Options:</h4>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyProfileLink}
                className="flex-1 flex items-center space-x-1"
                data-testid="button-copy-link"
              >
                <Copy className="w-3 h-3" />
                <span className="text-xs">Copy Link</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={showQRCodeDialog}
                className="flex-1 flex items-center space-x-1"
                data-testid="button-qr-code"
              >
                <QrCode className="w-3 h-3" />
                <span className="text-xs">QR Code</span>
              </Button>
            </div>
          </div>

          {/* Profile URL Display */}
          <div className="space-y-2">
            <Label htmlFor="profile-url">Your Profile URL</Label>
            <div className="flex space-x-2">
              <Input
                id="profile-url"
                value={profileUrl}
                readOnly
                className="flex-1 text-xs"
                data-testid="input-profile-url"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyProfileLink}
                data-testid="button-copy-url"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <h5 className="font-medium text-blue-800 text-sm mb-1">Sharing Tips:</h5>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Share during peak hours (7-9 PM) for maximum visibility</li>
                <li>• Use relevant hashtags to reach more people</li>
                <li>• Add a personal touch to stand out</li>
                <li>• Share in local groups for nearby connections</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>

      <QRCode
        isOpen={showQRCode}
        onOpenChange={setShowQRCode}
        profileUrl={profileUrl}
        userName={user.name}
      />
    </Dialog>
  );
}