interface DeviceMotionEventWithPermission {
  prototype: DeviceMotionEvent;
  new(eventInitDict?: DeviceMotionEventInit): DeviceMotionEvent;
  requestPermission?: () => Promise<PermissionState>;
}

interface Window {
  DeviceMotionEvent: DeviceMotionEventWithPermission;
}
