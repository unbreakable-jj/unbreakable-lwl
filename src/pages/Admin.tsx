import { useState } from 'react';
import { Users, Flag, Settings, Activity, Shield, UserCheck, Megaphone } from 'lucide-react';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import { PageHeader } from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AdminUsersPanel } from '@/components/admin/AdminUsersPanel';
import { AdminReportsPanel } from '@/components/admin/AdminReportsPanel';
import { AdminSettingsPanel } from '@/components/admin/AdminSettingsPanel';
import { AdminActivityPanel } from '@/components/admin/AdminActivityPanel';
import { SocialCommandCentre } from '@/components/admin/SocialCommandCentre';
import { useUserRole } from '@/hooks/useUserRole';
import CoachDashboard from '@/pages/CoachDashboard';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('coaching');
  const { isOwner, role } = useUserRole();

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-background">
        <PageHeader sectionLabel="DEV" />
        
        <div className="container mx-auto px-4 sm:px-6 py-6">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="font-display text-xl text-foreground tracking-wide">
                DEV DASHBOARD
              </h1>
            </div>
            <Badge variant="outline" className="font-display text-[10px] tracking-wider border-primary/30 text-primary">
              {role?.toUpperCase()}
            </Badge>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="flex-wrap">
              <TabsTrigger value="coaching" className="font-display gap-2 text-xs">
                <UserCheck className="w-4 h-4" />
                COACHING
              </TabsTrigger>
              <TabsTrigger value="users" className="font-display gap-2 text-xs">
                <Users className="w-4 h-4" />
                USERS
              </TabsTrigger>
              <TabsTrigger value="reports" className="font-display gap-2 text-xs">
                <Flag className="w-4 h-4" />
                REPORTS
              </TabsTrigger>
              {isOwner && (
                <TabsTrigger value="settings" className="font-display gap-2 text-xs">
                  <Settings className="w-4 h-4" />
                  SETTINGS
                </TabsTrigger>
              )}
              <TabsTrigger value="activity" className="font-display gap-2 text-xs">
                <Activity className="w-4 h-4" />
                LOGS
              </TabsTrigger>
              <TabsTrigger value="social" className="font-display gap-2 text-xs">
                <Megaphone className="w-4 h-4" />
                SOCIAL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="coaching">
              <CoachDashboard embedded />
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
