import SettingsForm from '@/components/settings-form';

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-headline font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your daily check-in reminders.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
