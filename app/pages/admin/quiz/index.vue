<script setup lang="ts">
import { h, resolveComponent } from "vue";
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";

type Quiz = {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "a" | "b" | "c" | "d";
  materialId: string;
  createdAt: string;
  updatedAt: string;
};

const data = ref<Quiz[]>([]);
const expanded = ref<Record<string, boolean>>({});
const UButton = resolveComponent("UButton");
const table = useTemplateRef("table");
const toast = useToast();

const stripHtml = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const columns: TableColumn<Quiz>[] = [
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
    accessorKey: "question",
    header: "Pertanyaan",
    cell: ({ row }) => stripHtml(row.original.question),
  },
  {
    accessorKey: "correctAnswer",
    header: "Jawaban Benar",
    cell: ({ row }) => row.original.correctAnswer.toUpperCase(),
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

const fetchQuizzes = async () => {
  const response = await $fetch("/api/quiz");
  data.value = response.data as Quiz[];
};

const handleEdit = (id: string) => {
  navigateTo(`/admin/quiz/ubah/${id}`);
};

const handleDelete = async (id: string) => {
  try {
    await $fetch(`/api/quiz/${id}`, {
      method: "DELETE",
    });

    toast.add({
      title: "Sukses",
      description: "Quiz berhasil dihapus",
      color: "success",
      icon: "i-heroicons-check-circle-20-solid",
    });

    await fetchQuizzes();
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message || "Gagal menghapus quiz",
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  }
};

onMounted(fetchQuizzes);
</script>

<template>
  <div>
    <NuxtLayout>
      <div class="divide-y divide-(--ui-border-accented) overflow-x-auto">
        <div class="flex justify-end pb-4">
          <UButton
            label="Tambah Quiz"
            color="neutral"
            variant="subtle"
            @click="navigateTo('/admin/quiz/tambah')"
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
              <div class="grid grid-cols-2 gap-4">
                <div v-for="option in ['A', 'B', 'C', 'D']" :key="option">
                  <span class="font-medium">{{ option }}.</span>
                  {{ row.original[`option${option}` as keyof Quiz] }}
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
