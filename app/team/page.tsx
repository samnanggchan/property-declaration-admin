'use client';

import React, { useState, useRef } from 'react';
import {
  UserPlus,
  Search,
  Trash2,
  Edit,
  Camera,
  Loader2,
  RefreshCw,
  MoreHorizontal,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUploadAvatarMutation,
  UserItem,
} from '@/lib/redux/api/usersApi';

const DEFAULT_ROLES = [
  'super_admin',
  'admin',
  'moderator',
  'viewer',
];

const ROLE_DESCRIPTIONS: Record<string, string> = {
  super_admin: 'Full system administration & all controls',
  admin: 'Manage users & property declarations',
  moderator: 'Review & modify property declarations',
  viewer: 'Read-only access to property declarations',
};

function getAvatarUrl(url?: string | null) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const rawApi = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3003';
  const origin = rawApi.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function TeamPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // RTK Query Hooks
  const { data, isLoading, isFetching, refetch } = useGetUsersQuery({
    search: search.trim() || undefined,
    page,
    limit: 10,
  });

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] =
    useUploadAvatarMutation();

  // Hidden File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

  // Form State (Shared pattern for Create/Edit)
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formStatus, setFormStatus] = useState<boolean>(true);
  const [formRoles, setFormRoles] = useState<string[]>(['user']);
  const [formAvatar, setFormAvatar] = useState('');

  // Handle opening Create Modal
  const handleOpenCreate = () => {
    setFormFirstName('');
    setFormLastName('');
    setFormUsername('');
    setFormEmail('');
    setFormPassword('');
    setFormStatus(true);
    setFormRoles(['viewer']);
    setFormAvatar('');
    setIsCreateOpen(true);
  };

  // Handle opening Edit Modal
  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setFormFirstName(user.firstName || '');
    setFormLastName(user.lastName || '');
    setFormUsername(user.username || '');
    setFormEmail(user.email);
    setFormPassword('');
    setFormStatus(user.isActive);
    setFormRoles(
      user.roles && user.roles.length
        ? user.roles.map((r) => r.toLowerCase())
        : ['viewer'],
    );
    setFormAvatar(user.avatar || '');
  };

  // Toggle role in form
  const toggleFormRole = (role: string) => {
    const norm = role.toLowerCase();
    if (formRoles.some((r) => r.toLowerCase() === norm)) {
      if (formRoles.length === 1) {
        toast.warning('A user must have at least one role assigned');
        return;
      }
      setFormRoles(formRoles.filter((r) => r.toLowerCase() !== norm));
    } else {
      setFormRoles([...formRoles, norm]);
    }
  };

  // Avatar Upload Handler
  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image exceeds maximum allowed size of 5 MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await uploadAvatar(formData).unwrap();
      const rawApi =
        process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3003';
      const origin = rawApi.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
      const fullUrl = res.url.startsWith('http')
        ? res.url
        : `${origin}${res.url}`;
      setFormAvatar(fullUrl);
      toast.success('Profile photo uploaded');
    } catch {
      // Fallback to base64 data url if upload fails
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormAvatar(reader.result);
          toast.info('Loaded photo preview');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formPassword.trim()) {
      toast.error('Email and password are required');
      return;
    }

    try {
      await createUser({
        email: formEmail.trim(),
        password: formPassword.trim(),
        username: formUsername.trim() || undefined,
        firstName: formFirstName.trim() || undefined,
        lastName: formLastName.trim() || undefined,
        roles: formRoles.length
          ? formRoles.map((r) => r.toUpperCase())
          : ['USER'],
        avatar: formAvatar.trim() || undefined,
        isActive: formStatus,
      }).unwrap();

      toast.success('User created successfully');
      setIsCreateOpen(false);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to create user';
      toast.error(msg);
    }
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await updateUser({
        id: editingUser.id,
        data: {
          email: formEmail.trim(),
          password: formPassword.trim() ? formPassword.trim() : undefined,
          username: formUsername.trim() || undefined,
          firstName: formFirstName.trim() || undefined,
          lastName: formLastName.trim() || undefined,
          roles: formRoles.length
            ? formRoles.map((r) => r.toUpperCase())
            : ['USER'],
          avatar: formAvatar.trim() || undefined,
          isActive: formStatus,
        },
      }).unwrap();

      toast.success('User updated successfully');
      setEditingUser(null);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to update user';
      toast.error(msg);
    }
  };

  // Delete User
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id).unwrap();
      toast.success(`User ${userToDelete.email} deleted`);
      setUserToDelete(null);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ??
        'Failed to delete user';
      toast.error(msg);
    }
  };

  // Toggle user active status directly from row menu
  const handleToggleStatus = async (user: UserItem) => {
    try {
      await updateUser({
        id: user.id,
        data: { isActive: !user.isActive },
      }).unwrap();
      toast.success(
        `User ${user.email} marked as ${!user.isActive ? 'Active' : 'Inactive'}`,
      );
    } catch {
      toast.error('Failed to change user status');
    }
  };

  return (
    <div className="flex flex-col gap-5 px-4 lg:px-6">
      {/* Hidden file input for avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* ─── TOP HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Users
            </h2>
            <Badge
              variant="secondary"
              className="px-2 py-0.5 text-xs font-semibold"
            >
              {data?.meta?.total ?? 0} users
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage system users, assigned roles, and authentication credentials.
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-9 pl-8 text-xs"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-1.5 text-xs"
          >
            <RefreshCw
              className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

          <Button
            onClick={handleOpenCreate}
            size="sm"
            className="h-9 gap-1.5 bg-primary text-primary-foreground text-xs font-medium shadow-xs hover:bg-primary/90"
          >
            <UserPlus className="size-4" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      {/* ─── USERS TABLE ─────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[280px] font-semibold text-xs">User</TableHead>
              <TableHead className="font-semibold text-xs">Roles</TableHead>
              <TableHead className="w-[120px] font-semibold text-xs">Status</TableHead>
              <TableHead className="w-16 text-right font-semibold text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Loading users...
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : !data?.data?.length ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-12 text-center text-muted-foreground text-xs"
                >
                  No users found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              data.data.map((user) => {
                const fullName =
                  [user.firstName, user.lastName].filter(Boolean).join(' ') ||
                  user.email.split('@')[0];
                return (
                  <TableRow
                    key={user.id}
                    className="hover:bg-muted/30"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 rounded-full border shadow-2xs">
                          {user.avatar ? (
                            <AvatarImage
                              src={getAvatarUrl(user.avatar)}
                              alt={fullName}
                            />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">
                            {fullName.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-xs text-foreground">
                            {fullName}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {user.username
                              ? `@${user.username}`
                              : user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {user.roles.length ? (
                          user.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="outline"
                              className="text-[10.5px] font-mono font-medium py-0 px-2 bg-muted/20"
                            >
                              {role}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            No roles
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      {user.isActive ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 gap-1.5 py-0.5 text-[11px] font-medium"
                        >
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-muted-foreground gap-1.5 py-0.5 text-[11px] font-medium"
                        >
                          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => handleOpenEdit(user)}
                            className="cursor-pointer gap-2"
                          >
                            <Edit className="size-3.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleStatus(user)}
                            className="cursor-pointer gap-2"
                          >
                            {user.isActive ? (
                              <>
                                <XCircle className="size-3.5 text-amber-500" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="size-3.5 text-emerald-500" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setUserToDelete(user)}
                            className="text-destructive focus:text-destructive cursor-pointer gap-2"
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Pagination summary */}
        {data?.meta && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10 text-xs text-muted-foreground">
            <div>
              Page {data.meta.page} of {data.meta.totalPages} •{' '}
              {data.meta.total} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-8 text-xs"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(data.meta.totalPages, p + 1))
                }
                disabled={page >= data.meta.totalPages}
                className="h-8 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── EDIT USER MODAL ─────────────────────────────────────────────────── */}
      <Dialog
        open={Boolean(editingUser)}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent className="max-h-[92vh] max-w-xl overflow-hidden p-0 border border-border/80 shadow-2xl rounded-2xl flex flex-col">
          <DialogHeader className="border-b bg-muted/40 px-6 py-4 shrink-0 pr-12">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Edit className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground">
                  Edit User Account
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Update credentials, account status, and assigned system roles.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {editingUser && (
            <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto px-6 py-4 space-y-3.5 pb-6 flex-1">
                {/* Profile Photo Uploader Section */}
                <div className="flex items-center gap-4 p-3 rounded-xl border bg-muted/20">
                  <Avatar className="size-14 rounded-full border shadow-2xs ring-2 ring-background shrink-0">
                    {formAvatar ? (
                      <AvatarImage
                        src={getAvatarUrl(formAvatar)}
                        alt="Profile"
                      />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm uppercase">
                      {(formFirstName || formEmail || 'U').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingAvatar}
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
                      >
                        {isUploadingAvatar ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Camera className="size-3.5 text-muted-foreground" />
                        )}
                        <span>{formAvatar ? 'Change Photo' : 'Upload Photo'}</span>
                      </Button>
                      {formAvatar && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormAvatar('')}
                          className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                        >
                          <X className="size-3.5 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      JPG, PNG or WEBP up to 5MB
                    </p>
                  </div>
                </div>

                {/* First Name & Last Name (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      First Name
                    </Label>
                    <Input
                      placeholder="e.g. John"
                      value={formFirstName}
                      onChange={(e) => setFormFirstName(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      Last Name
                    </Label>
                    <Input
                      placeholder="e.g. Doe"
                      value={formLastName}
                      onChange={(e) => setFormLastName(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Username & Email (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      Username <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      required
                      placeholder="e.g. johndoe"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="email"
                      required
                      placeholder="e.g. user@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Password & Status (2 columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      Password (Optional)
                    </Label>
                    <Input
                      type="password"
                      placeholder="Leave blank to keep current"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      Status
                    </Label>
                    <Select
                      value={formStatus ? 'active' : 'inactive'}
                      onValueChange={(val) => setFormStatus(val === 'active')}
                    >
                      <SelectTrigger className="h-9 text-xs w-full">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'size-2 rounded-full',
                              formStatus ? 'bg-emerald-500' : 'bg-muted-foreground',
                            )}
                          />
                          <span>{formStatus ? 'Active' : 'Inactive'}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active" className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-emerald-500" />
                            <span>Active</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive" className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-muted-foreground" />
                            <span>Inactive</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Assigned Roles Section */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">
                      Assigned Roles <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formRoles.length} of {DEFAULT_ROLES.length} selected
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DEFAULT_ROLES.map((role) => {
                      const isChecked = formRoles.some(
                        (r) => r.toLowerCase() === role.toLowerCase(),
                      );
                      return (
                        <div
                          key={role}
                          onClick={() => toggleFormRole(role)}
                          className={cn(
                            'flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all',
                            isChecked
                              ? 'border-primary/50 bg-primary/5 shadow-2xs'
                              : 'border-border/60 hover:border-border hover:bg-muted/30',
                          )}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() => toggleFormRole(role)}
                            className="mt-0.5 pointer-events-none"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
                              {role}
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                              {ROLE_DESCRIPTIONS[role] || role}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-0 border-t bg-muted/20 px-6 py-3 flex items-center justify-end gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingUser(null)}
                  className="h-8 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isUpdating}
                  className="h-8 text-xs bg-primary text-primary-foreground font-medium cursor-pointer"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── ADD USER MODAL ─────────────────────────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[92vh] max-w-xl overflow-hidden p-0 border border-border/80 shadow-2xl rounded-2xl flex flex-col">
          <DialogHeader className="border-b bg-muted/40 px-6 py-4 shrink-0 pr-12">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <UserPlus className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-foreground">
                  Add New User
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Create a new account with credentials, status, and assigned roles.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto px-6 py-4 space-y-3.5 pb-6 flex-1">
              {/* Profile Photo Upload */}
              <div className="flex items-center gap-4 p-3 rounded-xl border bg-muted/20">
                <Avatar className="size-14 rounded-full border shadow-2xs ring-2 ring-background shrink-0">
                  {formAvatar ? (
                    <AvatarImage src={formAvatar} alt="Profile" />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm uppercase">
                    {(formFirstName || formEmail || 'U').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isUploadingAvatar}
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Camera className="size-3.5 text-muted-foreground" />
                      )}
                      <span>{formAvatar ? 'Change Photo' : 'Upload Photo'}</span>
                    </Button>
                    {formAvatar && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormAvatar('')}
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <X className="size-3.5 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    JPG, PNG or WEBP up to 5MB
                  </p>
                </div>
              </div>

              {/* First Name & Last Name (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    First Name
                  </Label>
                  <Input
                    placeholder="e.g. John"
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Last Name
                  </Label>
                  <Input
                    placeholder="e.g. Doe"
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Username & Email (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Username <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    required
                    placeholder="e.g. johndoe"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="email"
                    required
                    placeholder="e.g. user@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Password & Status (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Status
                  </Label>
                  <Select
                    value={formStatus ? 'active' : 'inactive'}
                    onValueChange={(val) => setFormStatus(val === 'active')}
                  >
                    <SelectTrigger className="h-9 text-xs w-full">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'size-2 rounded-full',
                            formStatus ? 'bg-emerald-500' : 'bg-muted-foreground',
                          )}
                        />
                        <span>{formStatus ? 'Active' : 'Inactive'}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active" className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive" className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-muted-foreground" />
                          <span>Inactive</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Assigned Roles Section */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">
                    Assigned Roles <span className="text-destructive">*</span>
                  </Label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {formRoles.length} of {DEFAULT_ROLES.length} selected
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEFAULT_ROLES.map((role) => {
                    const isChecked = formRoles.some(
                      (r) => r.toLowerCase() === role.toLowerCase(),
                    );
                    return (
                      <div
                        key={role}
                        onClick={() => toggleFormRole(role)}
                        className={cn(
                          'flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all',
                          isChecked
                            ? 'border-primary/50 bg-primary/5 shadow-2xs'
                            : 'border-border/60 hover:border-border hover:bg-muted/30',
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleFormRole(role)}
                          className="mt-0.5 pointer-events-none"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-xs text-foreground uppercase tracking-wider font-mono">
                            {role}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                            {ROLE_DESCRIPTIONS[role] || role}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-0 border-t bg-muted/20 px-6 py-3 flex items-center justify-end gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
                className="h-8 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreating}
                className="h-8 text-xs bg-primary text-primary-foreground font-medium cursor-pointer"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ─── DELETE USER CONFIRMATION MODAL ─────────────────────────────────── */}
      <Dialog
        open={Boolean(userToDelete)}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="size-5" />
              Delete User
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to permanently delete{' '}
            <strong className="text-foreground">
              {userToDelete?.email}
            </strong>
            ? This action cannot be undone.
          </p>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setUserToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
