# Firestore Schema (Overview)

Collections:

- users
  - Fields:
    - firstName: string
    - middleName: string
    - lastName: string
    - email: string
    - phone: string
    - jobId: reference/id (refers to `jobs` collection)
    - departmentId: reference/id (refers to `departments` collection)
    - roleId: reference/id (refers to `roles` collection)
    - employeeId: string
    - pagibig: string
    - sss: string
    - philhealth: string
    - address: string
    - tinId: string
    - basicPay: number/string
    - allowance: number/string
    - bankAccount: string
    - dateHired: timestamp/string
    - resignDate: timestamp/string | null
    - status: string ("Active"/"Inactive")
    - payClass: string
    - birthdate: timestamp/string
    - maritalStatus: string
    - nameOfDependents: string
    - lastActive: timestamp
    - createdAt: timestamp
    - updatedAt: timestamp

- jobs
  - Fields:
    - name: string
    - description: string (optional)

- departments
  - Fields:
    - name: string
    - description: string (optional)

- roles
  - Fields:
    - name: string (e.g., "Administrator")
    - permissions: map/object (optional)

Notes:
- Users store `jobId`, `departmentId`, and `roleId` to maintain a single source of truth for dropdown choices.
- When displaying users in the UI, resolve the referenced IDs to names by querying `jobs`, `departments`, and `roles` collections.
- Admins should be assigned a role document where `name == "Administrator"` and/or a custom claim `admin: true` for Firestore rules enforcement.
