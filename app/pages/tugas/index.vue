<script setup lang="ts">
type Assignment = {
  id: string;
  title: string;
  description?: string;
  type: "file" | "text";
  dueDate: string;
  grade: string;
  documentUrl?: string;
  submissions: {
    submittedAt?: string;
    score?: number;
    status: "pending" | "submitted" | "late" | "graded";
  }[];
};

const toast = useToast();
const assignments = ref<Assignment[]>([]);
const pagination = ref({ pageIndex: 1, pageSize: 5 });
const loading = ref(false);

// Fetch assignments from the server
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await $fetch("/api/assignments");
    assignments.value = response.data.map((assignment: any) => ({
      ...assignment,
      submissions: assignment.submissions || [],
    }));
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.data?.message || "Gagal memuat data tugas",
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  } finally {
    loading.value = false;
  }
};

// Format tanggal
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Status pengumpulan
const submissionStatus = (assignment: Assignment) => {
  const latestSubmission = assignment.submissions[0];

  if (!latestSubmission) return "Belum dikumpulkan";

  switch (latestSubmission.status) {
    case "late":
      return "Terlambat";
    case "submitted":
      return latestSubmission.score
        ? `Dinilai (${latestSubmission.score}/100)`
        : "Menunggu penilaian";
    case "graded":
      return `Dinilai (${latestSubmission.score}/100)`;
    default:
      return "Dalam penilaian";
  }
};

// Status warna badge
const statusColor = (assignment: Assignment) => {
  const latestSubmission = assignment.submissions[0];

  if (!latestSubmission) return "warning";

  switch (latestSubmission.status) {
    case "late":
      return "error";
    case "submitted":
      return "info";
    case "graded":
      return "success";
    default:
      return "info";
  }
};

// Navigasi ke halaman pengumpulan
const handleSubmit = (id: string) => {
  navigateTo(`/tugas/${id}`);
};

// Hapus HTML dari deskripsi
const strippedDescription = (html?: string) => {
  if (!html) return "";
  const stripped = html.replace(/<[^>]*>?/gm, "");
  return stripped.length > 200 ? `${stripped.slice(0, 200)}...` : stripped;
};

// Paginated assignments
const paginatedAssignments = computed(() => {
  const start = (pagination.value.pageIndex - 1) * pagination.value.pageSize;
  const end = start + pagination.value.pageSize;
  return assignments.value.slice(start, end);
});

onMounted(fetchData);
</script>

<template>
  <NuxtLayout>
    <div class="mx-auto max-w-4xl px-4 py-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Daftar Tugas
        </h1>
        <p class="text-gray-600 dark:text-gray-300">
          Kumpulkan tugas Kamu di sini
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <UIcon
          name="i-heroicons-spinner-20-solid"
          class="text-primary-500 mx-auto h-8 w-8 animate-spin"
        />
        <p class="mt-2 text-gray-600 dark:text-gray-300">Memuat tugas...</p>
      </div>

      <!-- Daftar Tugas -->
      <div v-else class="space-y-6">
        <TransitionGroup name="material-list">
          <UCard
            v-for="assignment in paginatedAssignments"
            :key="assignment.id"
            class="transition-all duration-200 hover:shadow-lg"
          >
            <template #header>
              <div class="flex items-center justify-between gap-3">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ assignment.title }}
                </h3>
                <div class="ml-2 flex items-center gap-2">
                  <UBadge
                    :color="statusColor(assignment)"
                    variant="subtle"
                    size="md"
                  >
                    {{ submissionStatus(assignment) }}
                  </UBadge>
                  <span class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatDate(assignment.dueDate) }}
                  </span>
                </div>
              </div>
            </template>

            <!-- Konten -->
            <div class="space-y-4">
              <p class="line-clamp-3 text-gray-600 dark:text-gray-300">
                {{ strippedDescription(assignment.description) }}
              </p>

              <div
                v-if="assignment.submissions[0]?.submittedAt"
                class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
              >
                <UIcon name="i-heroicons-paper-airplane" class="h-5 w-5" />
                <span
                  >Dikumpulkan:
                  {{ formatDate(assignment.submissions[0].submittedAt) }}</span
                >
              </div>
            </div>

            <!-- Footer -->
            <template #footer>
              <UButton
                :color="!assignment.submissions.length ? 'primary' : 'neutral'"
                :label="
                  !assignment.submissions.length
                    ? 'Kumpulkan Sekarang'
                    : 'Lihat Detail'
                "
                block
                :trailing-icon="
                  assignment.submissions.length
                    ? 'i-heroicons-arrow-right'
                    : undefined
                "
                @click="handleSubmit(assignment.id)"
              />
            </template>
          </UCard>
        </TransitionGroup>
      </div>

      <!-- Empty State -->
      <div
        v-if="!loading && assignments.length === 0"
        class="py-12 text-center"
      >
        <UIcon
          name="i-heroicons-document-text"
          class="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500"
        />
        <p class="text-gray-600 dark:text-gray-400">Tidak ada tugas saat ini</p>
      </div>

      <!-- Pagination Controls -->
      <div
        v-if="assignments.length > pagination.pageSize"
        class="mt-8 flex justify-center"
      >
        <UPagination
          v-model="pagination.pageIndex"
          :page-count="pagination.pageSize"
          :total="assignments.length"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<style>
.material-list-enter-active,
.material-list-leave-active {
  transition: all 0.3s ease;
}

.material-list-enter-from,
.material-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
