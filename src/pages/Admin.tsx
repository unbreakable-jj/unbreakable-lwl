import { useState } from 'react';
import { Users, Flag, Settings, Activity, Shield, UserCheck, UserPlus } from 'lucide-react';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import { PageHeader } from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminUsersPanel } from '@/components/admin/AdminUsersPanel';
import { AdminReportsPanel } from '@/components/admin/AdminReportsPanel';
import { AdminSettingsPanel } from '@/components/admin/AdminSettingsPanel';
import { AdminActivityPanel } from '@/components/admin/AdminActivityPanel';
import { ClientSearchPanel } from '@/components/coaching/ClientSearchPanel';
import { useUserRole } from '@/hooks/useUserRole';
import CoachDashboard from '@/pages/CoachDashboard';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('athletes');
  const { isOwner, role } = useUserRole(); // isOwner = isDev in new naming

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-background">
        <PageHeader sectionLabel="DEV" />
        
        <div className="container mx-auto px-4 sm:px-6 py-6">
          {/* Admin Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl text-foreground tracking-wide">
                DEV DASHBOARD
              </h1>
              <p className="text-sm text-muted-foreground">
                Logged in as <span className="text-primary font-medium uppercase">{role}</span>
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="athletes" className="font-display gap-2">
                <UserCheck className="w-4 h-4" />
                ATHLETES
              </TabsTrigger>
              <TabsTrigger value="clients" className="font-display gap-2">
                <UserPlus className="w-4 h-4" />
                CLIENTS
              </TabsTrigger>
              <TabsTrigger value="users" className="font-display gap-2">
                <Users className="w-4 h-4" />
                USERS
              </TabsTrigger>
              <TabsTrigger value="reports" className="font-display gap-2">
                <Flag className="w-4 h-4" />
                REPORTS
              </TabsTrigger>
              {isOwner && (
                <TabsTrigger value="settings" className="font-display gap-2">
                  <Settings className="w-4 h-4" />
                  SETTINGS
                </TabsTrigger>
              )}
              <TabsTrigger value="activity" className="font-display gap-2">
                <Activity className="w-4 h-4" />
                LOGS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="athletes">
              <CoachDashboard embedded />
            </TabsContent>

            <TabsContent value="clients">
              <ClientSearchPanel />
            </TabsContent>

            <TabsContent value="users">
              <AdminUsersPanel />
            </TabsContent>

            <TabsContent value="reports">
              <AdminReportsPanel />
            </TabsContent>

            {isOwner && (
              <TabsContent value="settings">
                <AdminSettingsPanel />
              </TabsContent>
            )}

            <TabsContent value="activity">
              <AdminActivityPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminProtectedRoute>
  );
}
