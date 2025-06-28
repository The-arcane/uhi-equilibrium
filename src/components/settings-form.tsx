'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BellRing } from 'lucide-react';

const REMINDER_SETTINGS_KEY = 'equilibrium_reminder_settings';

const timeOptions = Array.from({ length: 15 }, (_, i) => {
  const hour = i + 7; // From 7:00 (7 AM) to 21:00 (9 PM)
  const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayTime = `${displayHour}:00 ${ampm}`;
  return { value: `${String(hour).padStart(2, '0')}:00`, label: displayTime };
});

export default function SettingsForm() {
  const [isClient, setIsClient] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('09:00');
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setPermission(Notification.permission);

    const savedSettings = localStorage.getItem(REMINDER_SETTINGS_KEY);
    if (savedSettings) {
      try {
        const { enabled: savedEnabled, time: savedTime } = JSON.parse(savedSettings);
        setEnabled(savedEnabled);
        setTime(savedTime);
      } catch (error) {
        console.error("Failed to parse reminder settings", error);
      }
    }
  }, []);

  const handleToggleChange = async (isChecked: boolean) => {
    if (isChecked) {
      let currentPermission = permission;
      if (currentPermission === 'default') {
        currentPermission = await Notification.requestPermission();
        setPermission(currentPermission);
      }

      if (currentPermission === 'denied') {
        toast({
          title: 'Notifications Blocked',
          description: 'Please enable notifications in your browser settings to receive reminders.',
          variant: 'destructive',
        });
        return;
      }
      
      if (currentPermission === 'granted') {
         setEnabled(true);
      }
    } else {
      setEnabled(false);
    }
  };
  
  useEffect(() => {
    if (!isClient) return;
    
    navigator.serviceWorker.ready.then((registration) => {
        const settings = { enabled, time };
        localStorage.setItem(REMINDER_SETTINGS_KEY, JSON.stringify(settings));

        if (enabled && permission === 'granted') {
          registration.active?.postMessage({
            type: 'SCHEDULE_REMINDER',
            time: time,
          });
        } else {
          registration.active?.postMessage({
            type: 'CANCEL_REMINDER',
          });
        }
    });

  }, [enabled, time, permission, isClient]);


  if (!isClient) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BellRing className="w-6 h-6" />
            Daily Reminders
        </CardTitle>
        <CardDescription>
          Receive a notification each day to complete your check-in.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
          <Label htmlFor="reminders-switch" className="font-medium cursor-pointer">
            Enable daily reminders
          </Label>
          <Switch
            id="reminders-switch"
            checked={enabled && permission === 'granted'}
            onCheckedChange={handleToggleChange}
            disabled={permission === 'denied'}
            aria-label="Enable daily reminders"
          />
        </div>
        {permission === 'denied' && (
            <p className="text-sm text-destructive text-center">
                You have blocked notifications. You'll need to re-enable them in your browser or site settings to use this feature.
            </p>
        )}
        <div className="space-y-2">
          <Label htmlFor="reminder-time">Reminder time</Label>
          <Select
            value={time}
            onValueChange={setTime}
            disabled={!enabled || permission !== 'granted'}
          >
            <SelectTrigger id="reminder-time" className="w-[180px]">
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
