import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Play, Pause, Send, X, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceMessageRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
  maxDuration?: number; // in seconds
}

export function VoiceMessageRecorder({ 
  onSend, 
  onCancel, 
  maxDuration = 120 // 2 minutes default 
}: VoiceMessageRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
            return maxDuration;
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record voice messages.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        
        // Resume timer
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => {
            const newTime = prev + 1;
            if (newTime >= maxDuration) {
              stopRecording();
              return maxDuration;
            }
            return newTime;
          });
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        
        // Pause timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const sendVoiceMessage = () => {
    if (audioBlob && recordingTime > 0) {
      onSend(audioBlob, recordingTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium">Voice Message</span>
        </div>
        <Badge variant="outline" className="text-xs">
          {formatTime(recordingTime)} / {formatTime(maxDuration)}
        </Badge>
      </div>

      {/* Recording visualizer */}
      <div className="flex items-center justify-center mb-4">
        <div className="flex space-x-1">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-gradient-to-t from-pink-400 to-purple-600 rounded-full transition-all duration-150 ${
                isRecording && !isPaused 
                  ? `h-${Math.random() > 0.5 ? '8' : '4'} animate-pulse` 
                  : 'h-2'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-3">
        {!isRecording && !audioBlob && (
          <Button
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12"
            data-testid="button-start-recording"
          >
            <Mic className="w-5 h-5" />
          </Button>
        )}

        {isRecording && (
          <>
            <Button
              onClick={pauseRecording}
              variant="outline"
              size="sm"
              data-testid="button-pause-recording"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button
              onClick={stopRecording}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10"
              data-testid="button-stop-recording"
            >
              <MicOff className="w-4 h-4" />
            </Button>
          </>
        )}

        {audioBlob && !isRecording && (
          <>
            <Button
              onClick={playRecording}
              variant="outline"
              size="sm"
              data-testid="button-play-recording"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              onClick={sendVoiceMessage}
              className="gradient-primary text-white"
              data-testid="button-send-voice"
            >
              <Send className="w-4 h-4 mr-1" />
              Send
            </Button>
          </>
        )}

        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          data-testid="button-cancel-voice"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Audio element for playback */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* Recording status */}
      {isRecording && (
        <div className="text-center mt-3">
          <p className="text-sm text-gray-600">
            {isPaused ? "Recording paused..." : "Recording..."}
          </p>
        </div>
      )}
    </div>
  );
}