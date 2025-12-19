"use client"

import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@heroui/react"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, Mail } from "lucide-react"

export function UserMenu() {
  const { user, logout } = useAuth()

  if (!user) return null

  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email[0].toUpperCase()
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button variant="flat" className="gap-2 pl-2">
          <Avatar
            size="sm"
            name={getInitials()}
            classNames={{
              base: "bg-primary/20",
              name: "text-primary font-semibold text-xs",
            }}
          />
          <span className="max-w-[120px] truncate">{user.name || user.email}</span>
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="User menu" className="w-64">
        <DropdownItem key="profile" isReadOnly className="cursor-default opacity-100" textValue="Profile">
          <div className="flex items-start gap-2 py-2">
            <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <p className="text-xs text-muted-foreground">Signed in as</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          </div>
        </DropdownItem>
        <DropdownItem
          key="logout"
          color="danger"
          className="text-danger"
          startContent={<LogOut className="h-4 w-4" />}
          onPress={logout}
        >
          Sign Out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}
