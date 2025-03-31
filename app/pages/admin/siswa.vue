<script setup lang="ts">
import { h, resolveComponent } from "vue";
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";

type Student = {
  id: string;
  fullname: string;
  username: string;
  role: string;
  grade: string;
};

const data = ref<Student[]>([]);
const fullname = ref("");
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const grade = ref("");
const isLoading = ref(false);
const isModalOpen = ref(false);
const isEditMode = ref(false);
const selectedStudentId = ref("");

const UButton = resolveComponent("UButton");
const table = useTemplateRef("table");
const toast = useToast();

const columns: TableColumn<Student>[] = [
  {
    accessorKey: "fullname",
    header: "Nama Lengkap",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "grade",
    header: "Kelas",
  },
  {
    accessorKey: "actions",
    header: "Aksi",
    cell: ({ row }) =>
      h("div", { class: "flex gap-2" }, [
        h(UButton, {
          icon: "i-heroicons-pencil-square-20-solid",
          color: "primary",
          variant: "outline",
          onClick: () => handleEdit(row.original.id),
        }),
        h(UButton, {
          icon: "i-heroicons-trash-20-solid",
          color: "error",
          variant: "outline",
          onClick: () => handleDelete(row.original.id),
        }),
      ]),
  },
];

const pagination = ref({
  pageIndex: 0,
  pageSize: 5,
});

const resetForm = () => {
  fullname.value = "";
  username.value = "";
  password.value = "";
  grade.value = "";
  selectedStudentId.value = "";
  showPassword.value = false;
  isEditMode.value = false;
  isLoading.value = false;
  isModalOpen.value = false;
};

const fetchStudents = async () => {
  const response = await $fetch("/api/students");
  data.value = response.data as Student[];
};

const handleCreate = async () => {
  isLoading.value = true;

  try {
    await $fetch("/api/students", {
      method: "POST",
      body: {
        fullname: fullname.value,
        username: username.value,
        password: password.value,
        grade: grade.value,
      },
    });

    toast.add({
      title: "Sukses",
      description: "Siswa berhasil ditambahkan",
      color: "success",
      icon: "i-heroicons-check-circle-20-solid",
    });

    isModalOpen.value = false;
    await fetchStudents();
  } catch (error: any) {
    isLoading.value = false;

    toast.add({
      title: "Error",
      description: error.data?.message,
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  }
};

const handleEdit = (id: string) => {
  const student = data.value.find((s) => s.id === id);

  if (student) {
    isModalOpen.value = true;
    isEditMode.value = true;
    selectedStudentId.value = id;
    fullname.value = student.fullname;
    username.value = student.username;
    grade.value = student.grade;
    password.value = "";
  }
};

const handleUpdate = async () => {
  isLoading.value = true;

  try {
    await $fetch(`/api/students/${selectedStudentId.value}`, {
      method: "PUT",
      body: {
        fullname: fullname.value,
        username: username.value,
        password: password.value,
        grade: grade.value,
      },
    });

    toast.add({
      title: "Sukses",
      description: "Siswa berhasil diperbarui",
      color: "success",
      icon: "i-heroicons-check-circle-20-solid",
    });

    isModalOpen.value = false;
    await fetchStudents();
  } catch (error: any) {
    isLoading.value = false;

    toast.add({
      title: "Error",
      description: error.data?.message,
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  }
};

const handleDelete = async (id: string) => {
  try {
    await $fetch(`/api/students/${id}`, {
      method: "DELETE",
    });

    toast.add({
      title: "Sukses",
      description: "Siswa berhasil dihapus",
      color: "success",
      icon: "i-heroicons-check-circle-20-solid",
    });

    await fetchStudents();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message,
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  }
};

onMounted(fetchStudents);
</script>

<template>
  <div>
    <NuxtLayout>
      <div class="divide-y divide-(--ui-border-accented) overflow-x-auto">
        <div class="flex justify-end pb-4">
          <UModal
            v-model:open="isModalOpen"
            :dismissible="false"
            :title="isEditMode ? 'Edit Siswa' : 'Tambah Siswa'"
            @after:leave="resetForm"
          >
            <UButton
              label="Tambah Siswa"
              color="neutral"
              variant="subtle"
              @click="isModalOpen = true"
            />

            <template #body>
              <div class="space-y-6">
                <UFormField label="Nama Lengkap" size="lg" required>
                  <UInput
                    v-model="fullname"
                    type="text"
                    placeholder="Masukkan Nama Lengkap"
                    icon="i-heroicons-user-circle-20-solid"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Username" size="lg" required>
                  <UInput
                    v-model="username"
                    type="text"
                    placeholder="Masukkan Username"
                    icon="i-heroicons-identification-20-solid"
                    class="w-full"
                  />
                </UFormField>

                <UFormField label="Password" size="lg" :required="!isEditMode">
                  <UInput
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    :placeholder="
                      isEditMode
                        ? 'Masukkan Password Baru'
                        : 'Masukkan Password'
                    "
                    icon="i-heroicons-key-20-solid"
                    :ui="{ trailing: 'pe-1' }"
                    class="w-full"
                  >
                    <template #trailing>
                      <UButton
                        color="neutral"
                        variant="link"
                        size="sm"
                        :icon="
                          showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'
                        "
                        @click="showPassword = !showPassword"
                      />
                    </template>
                  </UInput>
                </UFormField>

                <UFormField label="Kelas" size="lg" required>
                  <UInput
                    v-model="grade"
                    type="text"
                    placeholder="Masukkan Kelas"
                    icon="i-heroicons-academic-cap-20-solid"
                    class="w-full"
                  />
                </UFormField>

                <UButton
                  block
                  size="lg"
                  :disabled="
                    !fullname ||
                    !username ||
                    (!isEditMode && !password) ||
                    !grade
                  "
                  :loading="isLoading"
                  @click="isEditMode ? handleUpdate() : handleCreate()"
                >
                  {{ isEditMode ? "Update" : "Tambah" }}</UButton
                >
              </div>
            </template>
          </UModal>
        </div>

        <UTable
          ref="table"
          v-model:pagination="pagination"
          :data="data"
          :columns="columns"
          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel(),
          }"
        />

        <div class="flex justify-center pt-4">
          <UPagination
            :default-page="
              (table?.tableApi?.getState().pagination.pageIndex || 0) + 1
            "
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>
