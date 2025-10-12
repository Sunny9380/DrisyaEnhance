import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Mail, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Team() {
  const teamMembers = [
    {
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "active",
      processed: 3421,
      initials: "JD",
    },
    {
      name: "Sarah Smith",
      email: "sarah@example.com",
      role: "Editor",
      status: "active",
      processed: 892,
      initials: "SS",
    },
    {
      name: "Mike Johnson",
      email: "mike@example.com",
      role: "Viewer",
      status: "pending",
      processed: 0,
      initials: "MJ",
    },
  ];

  return (
    <div className="space-y-8" data-testid="page-team">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Workspace</h1>
          <p className="text-muted-foreground">
            Manage team members and their access levels
          </p>
        </div>
        <Button data-testid="button-invite-member">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Invite Form */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Invite Team Member</h2>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              type="email"
              placeholder="colleague@example.com"
              data-testid="input-invite-email"
            />
          </div>
          <Select defaultValue="editor">
            <SelectTrigger className="w-40" data-testid="select-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Button data-testid="button-send-invite">
            <Mail className="w-4 h-4 mr-2" />
            Send Invite
          </Button>
        </div>
      </Card>

      {/* Roles Explanation */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Role Permissions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Badge className="mb-2">Admin</Badge>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Full access to all features</li>
              <li>• Manage team members</li>
              <li>• Purchase coins</li>
              <li>• Process images</li>
            </ul>
          </div>
          <div>
            <Badge variant="secondary" className="mb-2">Editor</Badge>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Upload and process images</li>
              <li>• Download results</li>
              <li>• View analytics</li>
              <li>• Cannot manage team</li>
            </ul>
          </div>
          <div>
            <Badge variant="outline" className="mb-2">Viewer</Badge>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• View processed images</li>
              <li>• Download results</li>
              <li>• Read-only access</li>
              <li>• Cannot process images</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Team Members List */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Team Members ({teamMembers.length})</h2>
        <div className="space-y-3">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-muted rounded-lg"
              data-testid={`team-member-${index}`}
            >
              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <Badge
                    variant={
                      member.role === "Admin"
                        ? "default"
                        : member.role === "Editor"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {member.role}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {member.processed.toLocaleString()} images processed
                  </p>
                </div>
                <Badge
                  variant={member.status === "active" ? "default" : "secondary"}
                  className="w-20"
                >
                  {member.status}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Change Role</DropdownMenuItem>
                    <DropdownMenuItem>Resend Invite</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
