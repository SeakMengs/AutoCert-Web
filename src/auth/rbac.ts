type Role = keyof typeof ROLES;
type Permission = (typeof ROLES)[Role][number];

const ROLES = {
  requestor: [
    "view:comments",
    "create:comments",
    "update:comments",
    "delete:comments",
  ],
  signatory: ["view:comments", "create:comments"],
} as const;

export function hasPermission(role: Role, permissions: Permission[]) {
  return ROLES[role].some((permission) => permissions.includes(permission));
}

// Example usage
// hasPermission("requestor", ["create:comments"]);
