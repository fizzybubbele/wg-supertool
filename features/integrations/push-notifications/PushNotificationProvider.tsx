import { useEffect, useRef, type ReactNode } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { getSupabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerPushToken(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  if (!Device.isDevice) {
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return;
  }

  const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
  const tokenResponse = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined,
  );

  const {
    data: { user },
  } = await getSupabase().auth.getUser();

  if (!user) {
    return;
  }

  await getSupabase().from('push_tokens').upsert(
    {
      user_id: user.id,
      expo_push_token: tokenResponse.data,
      platform: Platform.OS,
    },
    { onConflict: 'user_id,expo_push_token' },
  );
}

export function PushNotificationProvider({ children }: { children: ReactNode }) {
  const registered = useRef(false);

  useEffect(() => {
    if (registered.current) {
      return;
    }
    registered.current = true;
    void registerPushToken().catch(() => undefined);
  }, []);

  return children;
}
