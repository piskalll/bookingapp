import { Link } from '@inertiajs/react';
import { LogOut, Settings, Shield, User as UserIcon } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const isAdmin = (user as any).role === 'admin';

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex flex-col gap-3 px-1 py-2 text-left text-sm">
                    <UserInfo user={user} showEmail={true} showRole={true} />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {isAdmin ? (
                            <>
                                <Shield size={14} className="text-blue-600 dark:text-blue-400" />
                                <span>Administrator</span>
                            </>
                        ) : (
                            <>
                                <UserIcon size={14} className="text-gray-600 dark:text-gray-400" />
                                <span>Member</span>
                            </>
                        )}
                    </div>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" size={16} />
                        Pengaturan Profil
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    onClick={cleanup}
                    className="cursor-pointer w-full"
                >
                    <LogOut className="mr-2" size={16} />
                    Keluar
                </Link>
            </DropdownMenuItem>
        </>
    );
}
