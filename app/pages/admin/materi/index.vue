<script setup lang="ts">
import { h, resolveComponent } from "vue";
import { getPaginationRowModel } from "@tanstack/vue-table";
import type { TableColumn } from "@nuxt/ui";

type LearningMaterial = {
  id: string;
  title: string;
  content: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
};

const data = ref<LearningMaterial[]>([]);
const expanded = ref<Record<string, boolean>>({});
const UButton = resolveComponent("UButton");
const table = useTemplateRef("table");
const toast = useToast();

const columns: TableColumn<LearningMaterial>[] = [
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
    header: "Judul",
  },
  {
    accessorKey: "documentUrl",
    header: "Dokumen",
    cell: ({ row }) =>
      row.original.documentUrl
        ? h(
            "a",
            {
              href: row.original.documentUrl,
              target: "_blank",
              class: "text-primary hover:underline",
            },
            "Lihat Dokumen",
          )
        : "-",
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

const fetchLearningMaterials = async () => {
  const response = await $fetch("/api/learning-materials");
  data.value = response.data as LearningMaterial[];
};

const handleEdit = (id: string) => {
  navigateTo(`/admin/materi/ubah/${id}`);
};

const handleDelete = async (id: string) => {
  try {
    await $fetch(`/api/learning-materials/${id}`, {
      method: "DELETE",
    });

    toast.add({
      title: "Sukses",
      description: "Materi pembelajaran berhasil dihapus",
      color: "success",
      icon: "i-heroicons-check-circle-20-solid",
    });

    await fetchLearningMaterials(); // Refresh data
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message || "Gagal menghapus materi",
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  }
};

onMounted(fetchLearningMaterials);
</script>

<template>
  <div>
    <NuxtLayout>
      <div class="divide-y divide-(--ui-border-accented) overflow-x-auto">
        <div class="flex justify-end pb-4">
          <UButton
            label="Tambah Materi"
            color="neutral"
            variant="subtle"
            @click="navigateTo('/admin/materi/tambah')"
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
              <div class="prose dark:prose-invert max-w-none">
                <div
                  class="tinymce-content"
                  v-html="row.original.content"
                ></div>
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
