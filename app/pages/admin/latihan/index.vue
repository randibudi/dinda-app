<script setup lang="ts">
import { h, resolveComponent } from "vue";
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";

type Exercise = {
  id: string;
  title: string;
  description: string;
  grade: string;
  createdAt: string;
  updatedAt: string;
  questions: ExerciseQuestion[];
};

type ExerciseQuestion = {
  id: string;
  question: string;
  correctAnswer: "benar" | "salah";
};

const data = ref<Exercise[]>([]);
const expanded = ref<Record<string, boolean>>({});
const UButton = resolveComponent("UButton");
const table = useTemplateRef("table");
const toast = useToast();

const columns: TableColumn<Exercise>[] = [
  {
    id: "expand",
    cell: ({ row }) =>
      h(UButton, {
        color: "neutral",
        variant: "ghost",
        icon: "i-heroicons-chevron-down-20-solid",
        square: true,
        "aria-label": "Expand",
        ui: {
          leadingIcon: [
            "transition-transform",
            row.getIsExpanded() ? "duration-200 rotate-180" : "",
          ],
        },
        onClick: () => row.toggleExpanded(),
      }),
  },
  {
    accessorKey: "title",
    header: "Judul Latihan",
  },
  {
    accessorKey: "description",
    header: "Deskripsi",
    cell: ({ row }) => row.original.description || "-",
  },
  {
    accessorKey: "grade",
    header: "Kelas",
    cell: ({ row }) => `Kelas ${row.original.grade}`,
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal Dibuat",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
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

const fetchExercises = async () => {
  try {
    const response = await $fetch("/api/exercises");
    data.value = response.data as Exercise[];
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Gagal memuat data latihan",
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  }
};

const handleEdit = (id: string) => {
  navigateTo(`/admin/latihan/ubah/${id}`);
};

const handleDelete = async (id: string) => {
  try {
    await $fetch(`/api/exercises/${id}`, {
      method: "DELETE",
    });

    toast.add({
      title: "Sukses",
      description: "Latihan berhasil dihapus",
      color: "success",
      icon: "i-heroicons-check-circle-20-solid",
    });

    await fetchExercises();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message || "Gagal menghapus latihan",
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  }
};

onMounted(fetchExercises);
</script>

<template>
  <div>
    <NuxtLayout>
      <div class="divide-y divide-(--ui-border-accented) overflow-x-auto">
        <div class="flex items-center justify-between pb-4">
          <div>
            <h1 class="text-2xl font-bold">Manajemen Latihan</h1>
            <p class="mt-1 text-gray-500 dark:text-gray-400">
              Kelola latihan dan soal pembelajaran
            </p>
          </div>
          <UButton
            label="Tambah Latihan"
            color="primary"
            @click="navigateTo('/admin/latihan/tambah')"
          />
        </div>

        <UTable
          ref="table"
          v-model:expanded="expanded"
          v-model:pagination="pagination"
          :data="data"
          :columns="columns"
          :pagination-options="{
            getPaginationRowModel: getPaginationRowModel(),
          }"
          :ui="{ tr: 'data-[expanded=true]:bg-(--ui-bg-elevated)/50' }"
        >
          <template #expanded="{ row }">
            <div class="bg-gray-50/50 p-4 dark:bg-gray-800/50">
              <h3 class="mb-3 font-semibold">Daftar Soal</h3>

              <div
                v-if="row.original.questions.length === 0"
                class="text-gray-500"
              >
                Belum ada soal
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="(question, index) in row.original.questions"
                  :key="question.id"
                  class="border-b border-gray-200 pb-3 last:border-0 last:pb-0 dark:border-gray-700"
                >
                  <div class="flex items-start">
                    <span class="mr-2 font-medium">{{ index + 1 }}.</span>
                    <div>
                      <div
                        class="tinymce-content"
                        v-html="question.question"
                      ></div>
                      <div class="mt-2 flex items-center">
                        <span class="mr-2 text-sm font-medium"
                          >Jawaban Benar:</span
                        >
                        <UBadge
                          :color="
                            question.correctAnswer === 'benar' ? 'green' : 'red'
                          "
                          variant="subtle"
                        >
                          {{ question.correctAnswer }}
                        </UBadge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Terakhir diperbarui:
                {{ new Date(row.original.updatedAt).toLocaleDateString() }}
              </div>
            </div>
          </template>
        </UTable>

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
