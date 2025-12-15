# PH-HealthCare Frontend Development Task

## 📋 Project Overview

You are tasked with completing the frontend development for **Admin Management, Patient Management, Schedule Management, and Appointment Management** modules in the PH-HealthCare application. The backend API is fully implemented and operational. Your responsibility is to develop a professional, production-ready frontend that matches the quality standards set by the existing **Specialities Management** and **Doctors Management** modules.

---

## 🎯 Task Objectives

Complete the following four management modules with full CRUD operations:

1. **Admin Management** (`/admin/dashboard/admins-management`)
2. **Patient Management** (`/admin/dashboard/patients-management`)
3. **Schedule Management** (`/admin/dashboard/schedules-management`)
4. **Appointment Management** (`/admin/dashboard/appointments-management`)

---

## 🏗️ Technical Stack & Architecture

### Core Technologies

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui (Radix UI)
- **Validation**: Zod
- **State Management**: React Hooks (useState, useTransition, useActionState)
- **Icons**: Lucide React
- **Notifications**: Sonner (toast)

### Project Structure

```
src/
├── app/(dashboardLayout)/admin/dashboard/
│   ├── [module-name]-management/
│   │   └── page.tsx                          # Main page with filters & pagination
├── components/
│   ├── modules/Admin/[ModuleName]Management/
│   │   ├── [ModuleName]ManagementHeader.tsx # Header with Add button
│   │   ├── [ModuleName]FormDialog.tsx       # Create/Edit form dialog
│   │   ├── [ModuleName]Table.tsx            # Table with actions
│   │   ├── [ModuleName]ViewDetailDialog.tsx # View details dialog
│   │   └── [moduleName]Columns.tsx          # Column definitions
│   └── shared/                               # Reusable components
├── services/admin/
│   └── [moduleName]Management.ts            # Server actions
├── types/
│   └── [moduleName].interface.ts            # TypeScript interfaces
└── zod/
    └── [moduleName].validation.ts           # Zod schemas
```

---

## 📖 Reference Implementation Analysis

### Example 1: Specialities Management (Simple CRUD)

#### 1. **Server Actions** (`src/services/admin/specialitiesManagement.ts`)

```typescript
"use server";
import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";

// CREATE operation with Zod validation
export async function createSpeciality(_prevState: any, formData: FormData) {
  try {
    const payload = { title: formData.get("title") as string };

    // Validate with Zod
    const validation = zodValidator(payload, createSpecialityZodSchema);
    if (!validation.success) return validation;

    // Prepare FormData for file upload
    const newFormData = new FormData();
    newFormData.append("data", JSON.stringify(validation.data));
    if (formData.get("file")) {
      newFormData.append("file", formData.get("file") as Blob);
    }

    const response = await serverFetch.post("/specialties", {
      body: newFormData,
    });
    return await response.json();
  } catch (error: any) {
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    };
  }
}

// READ operation
export async function getSpecialities() {
  const response = await serverFetch.get("/specialties");
  return await response.json();
}

// DELETE operation
export async function deleteSpeciality(id: string) {
  const response = await serverFetch.delete(`/specialties/${id}`);
  return await response.json();
}
```

#### 2. **Zod Validation** (`src/zod/specialities.validation.ts`)

```typescript
import z from "zod";

export const createSpecialityZodSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
});
```

#### 3. **TypeScript Interface** (`src/types/specialities.interface.ts`)

```typescript
export interface ISpecialty {
  id: string;
  title: string;
  icon: string;
}
```

#### 4. **Form Dialog Component** (Key Features)

- Uses `useActionState` hook for form submission
- Implements file upload for images
- Shows validation errors per field
- Toast notifications on success/error
- Loading state during submission
- Scrollable content within viewport

#### 5. **Table Columns Definition** (`specialitiesColumns.tsx`)

```typescript
import { Column } from "@/components/shared/ManagementTable";

export const specialitiesColumns: Column<ISpecialty>[] = [
  {
    header: "Icon",
    accessor: (speciality) => (
      <Image
        src={speciality.icon}
        alt={speciality.title}
        width={40}
        height={40}
        className="rounded-full"
      />
    ),
  },
  {
    header: "Title",
    accessor: (speciality) => speciality.title,
  },
];
```

#### 6. **Main Page Structure** (`page.tsx`)

- **Server Component** for data fetching
- Suspense boundaries with skeleton loaders
- Refresh button for data refresh
- Header with "Add" button
- Table with actions (View, Edit, Delete)

---

### Example 2: Doctors Management (Complex CRUD)

#### 1. **Server Actions with Complex Payload**

```typescript
export async function createDoctor(_prevState: any, formData: FormData) {
  // Extract and structure complex payload
  const payload: IDoctor = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    contactNumber: formData.get("contactNumber") as string,
    // ... 10 more fields
  };

  // Validate
  const validation = zodValidator(payload, createDoctorZodSchema);
  if (!validation.success) return validation;

  // Restructure for API
  const apiPayload = {
    password: validation.data.password,
    doctor: {
      /* nested object */
    },
  };

  // Send with file
  const formData = new FormData();
  formData.append("data", JSON.stringify(apiPayload));
  if (formData.get("file")) {
    formData.append("file", formData.get("file") as Blob);
  }

  const response = await serverFetch.post("/user/create-doctor", {
    body: formData,
  });
  return await response.json();
}

export async function updateDoctor(
  id: string,
  _prevState: any,
  formData: FormData
) {
  // Partial update (no password, no email)
  const payload: Partial<IDoctor> = {
    /* only updatable fields */
  };
  const validation = zodValidator(payload, updateDoctorZodSchema);

  const response = await serverFetch.patch(`/doctor/${id}`, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(validation.data),
  });
  return await response.json();
}

export async function softDeleteDoctor(id: string) {
  const response = await serverFetch.delete(`/doctor/soft/${id}`);
  return await response.json();
}
```

#### 2. **Complex Form with Controlled Inputs**

```typescript
const DoctorFormDialog = ({ open, onClose, doctor, specialities }) => {
  const isEdit = !!doctor;

  // Controlled state for Select components
  const [selectedSpeciality, setSelectedSpeciality] = useState<string>("");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");

  // Server action with dynamic binding for edit
  const [state, formAction, pending] = useActionState(
    isEdit ? updateDoctor.bind(null, doctor.id!) : createDoctor,
    null
  );

  // Toast notifications
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onSuccess();
      onClose();
    } else if (state && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] flex flex-col p-0">
        {/* Fixed Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{isEdit ? "Edit Doctor" : "Add New Doctor"}</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
            {/* Text Input */}
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input name="name" defaultValue={doctor?.name} required />
              <InputFieldError state={state} field="name" />
            </Field>

            {/* Conditional Fields (Create Only) */}
            {!isEdit && (
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input name="password" type="password" required />
                <InputFieldError state={state} field="password" />
              </Field>
            )}

            {/* Controlled Select with Hidden Input */}
            <Field>
              <FieldLabel>Speciality</FieldLabel>
              <input
                name="specialities"
                value={selectedSpeciality}
                type="hidden"
                readOnly
              />
              <Select
                value={selectedSpeciality}
                onValueChange={setSelectedSpeciality}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a speciality" />
                </SelectTrigger>
                <SelectContent>
                  {specialities.map((spec) => (
                    <SelectItem key={spec.id} value={spec.id}>
                      {spec.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputFieldError state={state} field="specialities" />
            </Field>

            {/* File Upload (Create Only) */}
            {!isEdit && (
              <Field>
                <FieldLabel htmlFor="file">Profile Photo</FieldLabel>
                <Input name="file" type="file" accept="image/*" />
              </Field>
            )}
          </div>

          {/* Fixed Footer */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

#### 3. **Advanced Table Columns with Custom Cells**

```typescript
import { UserInfoCell } from "@/components/shared/cell/UserInfoCell";
import { StatusBadgeCell } from "@/components/shared/cell/StatusBadgeCell";
import { DateCell } from "@/components/shared/cell/DateCell";

export const doctorsColumns: Column<IDoctor>[] = [
  {
    header: "Doctor",
    accessor: (doctor) => (
      <UserInfoCell
        name={doctor.name}
        email={doctor.email}
        photo={doctor.profilePhoto}
      />
    ),
  },
  {
    header: "Specialties",
    accessor: (doctor) => (
      <div className="flex flex-wrap gap-1">
        {doctor.doctorSpecialties?.map((spec, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full 
                                     text-xs font-medium bg-blue-100 text-blue-800"
          >
            {spec.specialties?.title || "N/A"}
          </span>
        )) || <span className="text-xs text-gray-500">No specialties</span>}
      </div>
    ),
  },
  {
    header: "Fee",
    accessor: (doctor) => (
      <span className="text-sm font-semibold text-green-600">
        ${doctor.appointmentFee}
      </span>
    ),
  },
  {
    header: "Rating",
    accessor: (doctor) => (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span>{doctor.averageRating.toFixed(1)}</span>
      </div>
    ),
  },
  {
    header: "Status",
    accessor: (doctor) => <StatusBadgeCell isDeleted={doctor.isDeleted} />,
  },
  {
    header: "Joined",
    accessor: (doctor) => <DateCell date={doctor.createdAt} />,
  },
];
```

#### 4. **Main Page with Filters & Pagination**

```typescript
const AdminDoctorsManagementPage = async ({ searchParams }) => {
  const searchParamsObj = await searchParams;
  const queryString = queryStringFormatter(searchParamsObj);

  // Fetch data with query string
  const specialitiesResult = await getSpecialities();
  const doctorsResult = await getDoctors(queryString);

  const totalPages = Math.ceil(
    doctorsResult.meta.total / doctorsResult.meta.limit
  );

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <DoctorsManagementHeader specialities={specialitiesResult.data} />

      {/* Filters */}
      <div className="flex space-x-2">
        <SearchFilter paramName="searchTerm" placeholder="Search doctors..." />
        <SelectFilter
          paramName="speciality"
          options={specialitiesResult.data.map((spec) => ({
            label: spec.title,
            value: spec.title,
          }))}
          placeholder="Filter by speciality"
        />
        <RefreshButton />
      </div>

      {/* Table with Suspense */}
      <Suspense fallback={<TableSkeleton columns={10} rows={10} />}>
        <DoctorsTable
          doctors={doctorsResult.data}
          specialities={specialitiesResult.data}
        />
        <TablePagination
          currentPage={doctorsResult.meta.page}
          totalPages={totalPages}
        />
      </Suspense>
    </div>
  );
};
```

#### 5. **View Detail Dialog with Beautiful UI**

```typescript
const DoctorViewDetailDialog = ({ open, onClose, doctor }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Doctor Profile</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Gradient Header with Avatar */}
          <div
            className="flex items-center gap-6 p-6 
                                    bg-linear-to-br from-blue-50 to-indigo-50 
                                    rounded-lg mb-6"
          >
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={doctor?.profilePhoto} />
              <AvatarFallback>{getInitials(doctor?.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-3xl font-bold">{doctor?.name}</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {doctor?.email}
              </p>
              <div className="flex gap-2">
                <Badge variant={doctor?.isDeleted ? "destructive" : "default"}>
                  {doctor?.isDeleted ? "Inactive" : "Active"}
                </Badge>
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400" />
                  {doctor.averageRating.toFixed(1)} Rating
                </Badge>
              </div>
            </div>
          </div>

          {/* Sections with Icons */}
          <div className="space-y-6">
            {/* Professional Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">
                  Professional Information
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                <InfoRow
                  label="Designation"
                  value={doctor?.designation || "Not specified"}
                />
                {/* More fields */}
              </div>
            </div>

            <Separator />

            {/* Specialties Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-lg">Specialties</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {doctor.doctorSpecialties.map((spec) => (
                  <Badge variant="outline" className="px-4 py-2">
                    {spec.specialties?.title}
                  </Badge>
                ))}
              </div>
            </div>

            {/* More sections: Contact, Personal */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

#### 6. **Table Component with Actions**

```typescript
const DoctorsTable = ({ doctors, specialities }) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deletingDoctor, setDeletingDoctor] = useState<IDoctor | null>(null);
  const [viewingDoctor, setViewingDoctor] = useState<IDoctor | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<IDoctor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRefresh = () => {
    startTransition(() => router.refresh());
  };

  const confirmDelete = async () => {
    if (!deletingDoctor) return;

    setIsDeleting(true);
    const result = await softDeleteDoctor(deletingDoctor.id!);
    setIsDeleting(false);

    if (result.success) {
      toast.success(result.message);
      setDeletingDoctor(null);
      handleRefresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      <ManagementTable
        data={doctors}
        columns={doctorsColumns}
        onView={(doctor) => setViewingDoctor(doctor)}
        onEdit={(doctor) => setEditingDoctor(doctor)}
        onDelete={(doctor) => setDeletingDoctor(doctor)}
        getRowKey={(doctor) => doctor.id!}
        emptyMessage="No doctors found"
      />

      {/* Edit Dialog */}
      <DoctorFormDialog
        open={!!editingDoctor}
        onClose={() => setEditingDoctor(null)}
        doctor={editingDoctor!}
        specialities={specialities}
        onSuccess={() => {
          setEditingDoctor(null);
          handleRefresh();
        }}
      />

      {/* View Dialog */}
      <DoctorViewDetailDialog
        open={!!viewingDoctor}
        onClose={() => setViewingDoctor(null)}
        doctor={viewingDoctor}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        open={!!deletingDoctor}
        onOpenChange={(open) => !open && setDeletingDoctor(null)}
        onConfirm={confirmDelete}
        title="Delete Doctor"
        description={`Are you sure you want to delete ${deletingDoctor?.name}?`}
        isDeleting={isDeleting}
      />
    </>
  );
};
```

---

## 🎨 Design Patterns & Best Practices

### 1. **Server Actions Pattern**

```typescript
"use server"

export async function create[Entity](_prevState: any, formData: FormData) {
    try {
        // 1. Extract payload from FormData
        const payload = { /* ... */ };

        // 2. Validate with Zod
        const validation = zodValidator(payload, createSchema);
        if (!validation.success) return validation;

        // 3. Prepare API payload (restructure if needed)
        const apiPayload = validation.data;

        // 4. Handle file uploads (if applicable)
        const newFormData = new FormData();
        newFormData.append("data", JSON.stringify(apiPayload));
        if (formData.get("file")) {
            newFormData.append("file", formData.get("file") as Blob);
        }

        // 5. Make API call
        const response = await serverFetch.post("/endpoint", {
            body: newFormData,
        });

        // 6. Return result
        return await response.json();

    } catch (error: any) {
        return {
            success: false,
            message: process.env.NODE_ENV === 'development'
                ? error.message
                : 'Something went wrong'
        };
    }
}
```

### 2. **Form Dialog Pattern**

- Use `useActionState` for server action integration
- Implement controlled state for `<Select>` components using hidden inputs
- Fixed header and footer with scrollable content area
- Conditional rendering for create vs edit mode
- Toast notifications for success/error feedback
- Loading states with disabled buttons
- Field-level error display using `InputFieldError` component

### 3. **Validation Pattern**

```typescript
// Zod Schema
export const createSchema = z.object({
  field1: z.string().min(3, "Message"),
  field2: z.number().min(0, "Message"),
  field3: z.enum(["VALUE1", "VALUE2"]),
  field4: z.string().email("Invalid email"),
  field5: z.string().optional(),
});

// Usage in Server Action
const validation = zodValidator(payload, createSchema);
if (!validation.success) {
  return validation; // Returns { success: false, errors: [{field, message}] }
}
```

### 4. **Error Display Pattern**

```typescript
// Component: InputFieldError
<InputFieldError state={state} field="fieldName" />

// Renders error message from state.errors array
// state = { success: false, errors: [{ field: "email", message: "Invalid email" }] }
```

### 5. **Table Management Pattern**

- Separate table logic into dedicated component
- Use `useTransition` for optimistic UI updates
- Manage dialog states with `useState` (viewing, editing, deleting)
- Implement confirmation dialogs for destructive actions
- Refresh data after mutations using `router.refresh()`

### 6. **Pagination & Filtering Pattern**

```typescript
// URL-based filters using searchParams
const queryString = queryStringFormatter({
  searchTerm: "John",
  speciality: "Cardiology",
  page: "1",
});
// Output: "searchTerm=John&speciality=Cardiology&page=1"

// Use with API call
const result = await get[Entities](queryString);

// Calculate total pages
const totalPages = Math.ceil(result.meta.total / result.meta.limit);
```

---

## 📝 Detailed Task Requirements

### **TASK 1: Admin Management**

#### Backend API Endpoints

- `POST /user/create-admin` - Create admin
- `GET /admin` - Get all admins (with filters)
- `GET /admin/:id` - Get admin by ID
- `PATCH /admin/:id` - Update admin
- `DELETE /admin/soft/:id` - Soft delete admin
- `DELETE /admin/:id` - Hard delete admin

#### Expected Fields (Admin Interface)

```typescript
interface IAdmin {
  id: string;
  name: string;
  email: string;
  password: string; // Create only
  contactNumber: string;
  profilePhoto?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### Deliverables

1. **Server Actions** (`src/services/admin/adminManagement.ts`)

   - `createAdmin(formData)` - With password field
   - `getAdmins(queryString?)` - Support search & pagination
   - `getAdminById(id)`
   - `updateAdmin(id, formData)` - Without password/email
   - `softDeleteAdmin(id)`

2. **Zod Validation** (`src/zod/admin.validation.ts`)

   - `createAdminZodSchema` - All fields required, password min 6 chars
   - `updateAdminZodSchema` - All fields optional except email/password

3. **TypeScript Interface** (`src/types/admin.interface.ts`)

4. **Components**

   - `AdminManagementHeader.tsx` - Header with "Add Admin" button
   - `AdminFormDialog.tsx` - Create/Edit form (5 fields)
   - `AdminTable.tsx` - Table with View/Edit/Delete actions
   - `AdminViewDetailDialog.tsx` - Detailed view with sections
   - `adminColumns.tsx` - Column definitions

5. **Main Page** (`src/app/(dashboardLayout)/admin/dashboard/admins-management/page.tsx`)
   - Search filter (name, email)
   - Pagination support
   - Refresh button
   - Suspense with skeleton loader

#### UI Requirements

- **Table Columns**: Avatar+Name+Email, Contact, Status, Joined Date, Actions
- **Form Fields**: Name, Email, Password (create only), Contact Number, Profile Photo (file upload, create only)
- **View Dialog**: Personal Info section, Contact Info section, Account Status
- **Validation**: Required fields marked, email format validation, password min 6 chars

---

### **TASK 2: Patient Management**

#### Backend API Endpoints

- `GET /patient` - Get all patients (with filters)
- `GET /patient/:id` - Get patient by ID
- `PATCH /patient/:id` - Update patient
- `DELETE /patient/soft/:id` - Soft delete patient
- `DELETE /patient/:id` - Hard delete patient

#### Expected Fields (Patient Interface)

```typescript
interface IPatient {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  address: string;
  profilePhoto?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional patient-specific fields based on backend schema
  medicalRecord?: {
    id: string;
    // medical history fields
  };
}
```

#### Deliverables

1. **Server Actions** (`src/services/admin/patientManagement.ts`)

   - `getPatients(queryString?)`
   - `getPatientById(id)`
   - `updatePatient(id, formData)`
   - `softDeletePatient(id)`

2. **Zod Validation** (`src/zod/patient.validation.ts`)

   - `updatePatientZodSchema`

3. **TypeScript Interface** (`src/types/patient.interface.ts`)

4. **Components**

   - `PatientManagementHeader.tsx` - Header without Add button (patients register themselves)
   - `PatientTable.tsx` - Table with View/Edit/Delete actions
   - `PatientViewDetailDialog.tsx` - Detailed view with medical records
   - `PatientFormDialog.tsx` - Edit only form
   - `patientColumns.tsx`

5. **Main Page**
   - Search filter (name, email)
   - Status filter (Active/Deleted)
   - Pagination
   - Refresh button

#### UI Requirements

- **Table Columns**: Avatar+Name+Email, Contact, Address, Status, Registered Date, Actions
- **Form Fields**: Name, Contact Number, Address (Edit only - no email/password)
- **View Dialog**: Personal Info, Contact Info, Medical Records (if available), Account Status
- **Note**: No "Add Patient" button (patients register via public registration)

---

### **TASK 3: Schedule Management**

#### Backend API Endpoints

- `POST /schedule` - Create schedule
- `GET /schedule` - Get all schedules (with filters)
- `GET /schedule/:id` - Get schedule by ID
- `DELETE /schedule/:id` - Delete schedule

#### Expected Fields (Schedule Interface)

```typescript
interface ISchedule {
  id: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  createdAt: string;
  updatedAt: string;
}
```

#### Deliverables

1. **Server Actions** (`src/services/admin/scheduleManagement.ts`)

   - `createSchedule(formData)`
   - `getSchedules(queryString?)`
   - `getScheduleById(id)`
   - `deleteSchedule(id)`

2. **Zod Validation** (`src/zod/schedule.validation.ts`)

   - `createScheduleZodSchema` - Validate date/time formats
   - Ensure endDate >= startDate
   - Ensure endTime > startTime

3. **TypeScript Interface** (`src/types/schedule.interface.ts`)

4. **Components**

   - `ScheduleManagementHeader.tsx` - Header with "Add Schedule" button
   - `ScheduleFormDialog.tsx` - Create form with date/time pickers
   - `ScheduleTable.tsx` - Table with View/Delete actions (NO EDIT)
   - `ScheduleViewDetailDialog.tsx` - Detailed view
   - `scheduleColumns.tsx`

5. **Main Page**
   - Date range filter (start date, end date)
   - Refresh button
   - Pagination

#### UI Requirements

- **Table Columns**: Start Date, End Date, Start Time, End Time, Duration (calculated), Created Date, Actions
- **Form Fields**: Start Date (date input), End Date (date input), Start Time (time input), End Time (time input)
- **View Dialog**: Schedule Details section with formatted dates/times
- **Validation**:
  - End date must be >= start date
  - End time must be > start time
  - All fields required
- **Note**: Schedules cannot be edited, only deleted

---

### **TASK 4: Appointment Management**

#### Backend API Endpoints

- `GET /appointment` - Get all appointments (with filters)
- `GET /appointment/:id` - Get appointment by ID
- `PATCH /appointment/status/:id` - Update appointment status

#### Expected Fields (Appointment Interface)

```typescript
interface IAppointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduleId: string;
  status: "SCHEDULED" | "INPROGRESS" | "COMPLETED" | "CANCELED";
  paymentStatus: "PAID" | "UNPAID";
  videoCallingId?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  patient: {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string;
  };
  doctor: {
    id: string;
    name: string;
    email: string;
    profilePhoto?: string;
  };
  schedule: {
    id: string;
    startDate: string;
    startTime: string;
    endTime: string;
  };
}
```

#### Deliverables

1. **Server Actions** (`src/services/admin/appointmentManagement.ts`)

   - `getAppointments(queryString?)`
   - `getAppointmentById(id)`
   - `updateAppointmentStatus(id, status)`

2. **Zod Validation** (`src/zod/appointment.validation.ts`)

   - `updateAppointmentStatusZodSchema` - Validate status enum

3. **TypeScript Interface** (`src/types/appointment.interface.ts`)

4. **Components**

   - `AppointmentManagementHeader.tsx` - Header without Add button
   - `AppointmentTable.tsx` - Table with View/Change Status actions
   - `AppointmentViewDetailDialog.tsx` - Comprehensive view with patient, doctor, schedule info
   - `AppointmentStatusDialog.tsx` - Dialog to update status
   - `appointmentColumns.tsx`

5. **Main Page**
   - Search filter (patient name, doctor name)
   - Status filter dropdown (SCHEDULED, INPROGRESS, COMPLETED, CANCELED)
   - Payment status filter (PAID, UNPAID)
   - Date range filter
   - Pagination
   - Refresh button

#### UI Requirements

- **Table Columns**:
  - Patient (Avatar + Name)
  - Doctor (Avatar + Name)
  - Schedule (Date + Time)
  - Status (Badge with color coding)
  - Payment Status (Badge)
  - Created Date
  - Actions
- **Status Badge Colors**:
  - SCHEDULED: Blue
  - INPROGRESS: Yellow
  - COMPLETED: Green
  - CANCELED: Red
- **View Dialog Sections**:
  1. Appointment Overview (Status, Payment Status, Video Calling ID)
  2. Patient Information (Name, Email, Contact, Photo)
  3. Doctor Information (Name, Email, Specialties, Photo)
  4. Schedule Details (Date, Time, Duration)
  5. Timestamps (Created, Updated)
- **Status Update Dialog**: Dropdown with 4 status options
- **Note**: Appointments cannot be created by admin (created by patients)

---

## 🔧 Utility Functions & Helpers

### Available Utilities

```typescript
// Formatters (src/lib/formatters.ts)
getInitials(name: string): string
formatDateTime(date: string | Date): string
queryStringFormatter(params: Record<string, string | string[]>): string

// Validation (src/lib/zodValidator.ts)
zodValidator<T>(payload: T, schema: ZodObject): ValidationResult

// API Client (src/lib/server-fetch.ts)
serverFetch.get(endpoint, options?)
serverFetch.post(endpoint, options?)
serverFetch.patch(endpoint, options?)
serverFetch.delete(endpoint, options?)
```

### Shared Components (Already Available)

- `<ManagementTable>` - Generic table component
- `<ManagementPageHeader>` - Page header with action button
- `<DeleteConfirmationDialog>` - Delete confirmation
- `<InputFieldError>` - Field-level error display
- `<SearchFilter>` - URL-based search input
- `<SelectFilter>` - URL-based select dropdown
- `<RefreshButton>` - Refresh page data
- `<TablePagination>` - Pagination controls
- `<TableSkeleton>` - Loading skeleton
- `<UserInfoCell>` - Avatar + Name + Email cell
- `<StatusBadgeCell>` - Status badge with color
- `<DateCell>` - Formatted date cell
- `<InfoRow>` - Label + Value row for view dialogs

---

## ✅ Quality Standards & Checklist

### Code Quality

- [ ] TypeScript strict mode compliance (no `any` except server actions)
- [ ] Proper error handling in all server actions
- [ ] Environment-aware error messages (dev vs production)
- [ ] Proper null/undefined checks in components
- [ ] Accessible form labels and ARIA attributes
- [ ] Responsive design (mobile, tablet, desktop)

### Validation

- [ ] Zod schemas for all form inputs
- [ ] Field-level validation with clear error messages
- [ ] Client-side validation feedback
- [ ] Server-side validation in server actions
- [ ] Required fields marked with asterisk or `required` attribute

### UX/UI

- [ ] Loading states for all async operations
- [ ] Success/Error toast notifications
- [ ] Confirmation dialogs for destructive actions
- [ ] Empty states with helpful messages
- [ ] Skeleton loaders during data fetching
- [ ] Disabled states during form submission
- [ ] Proper focus management in dialogs
- [ ] Keyboard navigation support

### Data Management

- [ ] Optimistic UI updates where appropriate
- [ ] Proper data refresh after mutations
- [ ] URL-based filtering and pagination
- [ ] Suspense boundaries for async components
- [ ] Proper error boundaries

### Performance

- [ ] Server components for data fetching
- [ ] Proper use of `"use client"` directive
- [ ] Minimized client-side JavaScript
- [ ] Efficient re-renders (avoid unnecessary state updates)
- [ ] Image optimization with Next.js `<Image>` component

---

## 📚 API Documentation Reference

### Response Format

```typescript
// Success Response
{
    success: true,
    message: "Operation successful",
    data: { /* entity or array of entities */ },
    meta?: {
        page: number,
        limit: number,
        total: number
    }
}

// Error Response
{
    success: false,
    message: "Error message",
    errorDetails?: any
}
```

### Query Parameters (GET endpoints)

- `searchTerm` - Search in name, email fields
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `sortBy` - Sort field
- `sortOrder` - "asc" | "desc"
- Additional entity-specific filters

---

## 🚀 Getting Started Guide

### Step 1: Environment Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (`.env.local`)
4. Run development server: `npm run dev`

### Step 2: Backend Testing

Test backend endpoints using API client (Postman/Thunder Client):

```bash
GET http://localhost:5000/api/v1/admin
POST http://localhost:5000/api/v1/user/create-admin
# Test all CRUD operations
```

### Step 3: Implementation Order (Recommended)

1. **Start with Admin Management** (simplest, similar to Specialities)
2. **Then Patient Management** (no create, edit only)
3. **Then Schedule Management** (date/time handling)
4. **Finally Appointment Management** (most complex, multiple relations)

### Step 4: Development Workflow

For each entity (Admin, Patient, Schedule, Appointment):

1. **Create TypeScript Interface** (`types/[entity].interface.ts`)
2. **Create Zod Schemas** (`zod/[entity].validation.ts`)
3. **Implement Server Actions** (`services/admin/[entity]Management.ts`)
   - Test each action in isolation
4. **Create Table Columns** (`components/modules/Admin/[Entity]Management/[entity]Columns.tsx`)
5. **Create Form Dialog** (`[Entity]FormDialog.tsx`)
   - Test create/edit functionality
6. **Create View Dialog** (`[Entity]ViewDetailDialog.tsx`)
7. **Create Table Component** (`[Entity]Table.tsx`)
8. **Create Header Component** (`[Entity]ManagementHeader.tsx`)
9. **Create Main Page** (`app/(dashboardLayout)/admin/dashboard/[entity]-management/page.tsx`)
10. **Test Complete Flow**: List → Create → View → Edit → Delete

### Step 5: Testing Checklist per Entity

- [ ] Create new entity (success case)
- [ ] Create with validation errors (error cases)
- [ ] View entity details
- [ ] Edit entity (success case)
- [ ] Edit with validation errors
- [ ] Delete entity with confirmation
- [ ] Search/Filter functionality
- [ ] Pagination navigation
- [ ] Refresh after mutations
- [ ] Loading states work correctly
- [ ] Error handling displays properly
- [ ] Responsive design on mobile/tablet

---

## 📖 Additional Resources

### Documentation

- [Next.js 16 App Router](https://nextjs.org/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Zod Validation](https://zod.dev/)
- [React useActionState](https://react.dev/reference/react/useActionState)
- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

### Code Style Guidelines

- Use functional components with TypeScript
- Prefer `const` over `let`
- Use arrow functions for components
- Use named exports over default exports (except for pages)
- Follow existing naming conventions (PascalCase for components, camelCase for functions)
- Add comments for complex logic
- Keep components focused and single-responsibility

### Git Workflow (If Applicable)

```bash
# Create feature branch
git checkout -b feature/admin-management

# Commit with descriptive messages
git commit -m "feat: implement admin management CRUD operations"

# Push and create PR
git push origin feature/admin-management
```

---

## 🎯 Evaluation Criteria

Your implementation will be evaluated on:

1. **Functionality (40%)**

   - All CRUD operations work correctly
   - Validation works as expected
   - Filters and pagination functional
   - Error handling implemented

2. **Code Quality (30%)**

   - TypeScript types properly defined
   - Clean, readable code
   - Follows existing patterns
   - Proper separation of concerns
   - No console errors or warnings

3. **UI/UX (20%)**

   - Professional appearance
   - Consistent with existing design
   - Responsive layout
   - Proper loading/error states
   - Accessible components

4. **Best Practices (10%)**
   - Server/Client components used appropriately
   - Performance optimizations
   - Security considerations
   - Proper error handling
   - Code documentation

---

## 💡 Pro Tips

1. **Start Small**: Don't try to build everything at once. Build one feature, test it, then move to the next.

2. **Use Existing Components**: Leverage all shared components (ManagementTable, InputFieldError, etc.) to maintain consistency.

3. **Test Early, Test Often**: Test each server action immediately after writing it before moving to UI.

4. **Follow the Pattern**: The Specialities and Doctors implementations provide all the patterns you need.

5. **Handle Edge Cases**: Always handle null/undefined values, empty arrays, and API errors.

6. **Console is Your Friend**: Use `console.log` liberally during development, but remove before submission.

7. **Read Error Messages**: TypeScript and React errors are usually very helpful - read them carefully.

8. **Responsive Design**: Test on different screen sizes regularly (Chrome DevTools).

9. **Commit Frequently**: Commit working code often so you can rollback if needed.

10. **Ask Questions**: If backend API structure is unclear, check with backend team or documentation.

---

## 🏆 Deliverable Checklist

Before submitting, ensure you have completed:

### Admin Management ✅

- [ ] Server actions with all CRUD operations
- [ ] Zod validation schemas
- [ ] TypeScript interfaces
- [ ] Form dialog (create & edit)
- [ ] View detail dialog
- [ ] Table with columns
- [ ] Main page with filters & pagination
- [ ] All functionality tested

### Patient Management ✅

- [ ] Server actions (get, update, delete)
- [ ] Zod validation schemas
- [ ] TypeScript interfaces
- [ ] Form dialog (edit only)
- [ ] View detail dialog
- [ ] Table with columns
- [ ] Main page with filters & pagination
- [ ] All functionality tested

### Schedule Management ✅

- [ ] Server actions with create, get, delete
- [ ] Zod validation with date/time validation
- [ ] TypeScript interfaces
- [ ] Form dialog (create only, with date/time inputs)
- [ ] View detail dialog
- [ ] Table with columns
- [ ] Main page with date filters & pagination
- [ ] All functionality tested

### Appointment Management ✅

- [ ] Server actions (get, update status)
- [ ] Zod validation schemas
- [ ] TypeScript interfaces
- [ ] Status update dialog
- [ ] View detail dialog with all relations
- [ ] Table with columns
- [ ] Main page with multiple filters & pagination
- [ ] All functionality tested

### General Requirements ✅

- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Responsive design works on mobile
- [ ] All buttons and actions functional
- [ ] Loading states implemented
- [ ] Error handling implemented
- [ ] Toast notifications working
- [ ] Code formatted and clean
- [ ] README updated (if needed)

---

## 📞 Support & Questions

If you encounter issues:

1. Review the reference implementations (Specialities & Doctors)
2. Check the backend API documentation
3. Review error messages carefully
4. Test API endpoints directly
5. Ask for clarification if needed

**Remember**: The goal is not just to complete the task, but to learn professional-level Next.js development patterns. Take your time, understand each pattern, and build with quality.

---

**Good luck! 🚀 Build something amazing!**

---

### Document Version

- **Created**: November 15, 2025
- **Version**: 1.0
- **Last Updated**: November 15, 2025
