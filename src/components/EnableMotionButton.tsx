"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";

interface Props {
  onPermissionGranted: () => void;
}

export function EnableMotionButton({ onPermissionGranted }: Props) {
  const handleClick = useCallback(async () => {
    if (
      typeof window.DeviceMotionEvent !== 'undefined' &&
      typeof window.DeviceMotionEvent.requestPermission === 'function'
    ) {
      try {
        const response = await window.DeviceMotionEvent.requestPermission?.();
        if (response === 'granted') {
          toast.success('Motion detection enabled!');
          onPermissionGranted();
        } else {
          toast.error('Motion permission denied');
        }
      } catch (err) {
        toast.error('Error requesting motion permission');
        console.error('Error requesting motion permission:', err);
      }
    } else {
      onPermissionGranted();
    }
  }, [onPermissionGranted]);

  return (
    <button
      onClick={() => void handleClick()}
      className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
    >
      Enable Motion
    </button>
  );
}
