<script setup lang="ts">
type Assignment = {
  id: string;
  title: string;
  description?: string;
  type: "file" | "text";
  question: string;
  dueDate: string;
  documentUrl?: string;
  submission?: {
    submittedAt?: string;
    fileUrl?: string;
    submissionText?: string;
    score?: number;
    status: "pending" | "submitted" | "late" | "graded";
  };
};

const route = useRoute();
const toast = useToast();

const assignmentId = route.params.id as string;
const assignment = ref<Assignment | null>(null);

const formData = reactive({
  file: null as File | null,
  textAnswer: "",
});

const isLoading = ref(false);
const isSubmitting = ref(false);
const isPastDue = computed(
  () => new Date() > new Date(assignment.value?.dueDate || ""),
);

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

// Handle file upload
const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    formData.file = input.files[0];
  }
};

// Fetch assignment data from the server
const fetchAssignment = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(`/api/assignments/${assignmentId}`);
    if (!response.ok) {
      throw new Error("Gagal memuat data tugas");
    }
    const data = await response.json();
    assignment.value = data.data;

    // Initialize formData with existing submission if available
    if (assignment.value?.submission) {
      if (assignment.value.submission.fileUrl) {
        formData.file = null;
      } else if (assignment.value.submission.submissionText) {
        formData.textAnswer = assignment.value.submission.submissionText;
      }
    }
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.message,
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
    await navigateTo("/tugas");
  } finally {
    isLoading.value = false;
  }
};

// Submit tugas
const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const formPayload = new FormData();

    if (assignment.value?.type === "file" && formData.file) {
      formPayload.append("file", formData.file);
    } else if (assignment.value?.type === "text") {
      formPayload.append("submissionText", formData.textAnswer);
    }

    const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
      method: "POST",
      body: formPayload,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengumpulkan tugas");
    }

    toast.add({
      title: "Berhasil",
      description: assignment.value?.submission
        ? "Pengumpulan berhasil diperbarui"
        : "Tugas berhasil dikumpulkan",
      color: "success",
      icon: "i-heroicons-check-circle",
    });

    navigateTo("/tugas");
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.message || "Terjadi kesalahan",
      color: "error",
      icon: "i-heroicons-exclamation-circle-20-solid",
    });
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(fetchAssignment);
</script>

<template>
  <NuxtLayout>
    <div class="mx-auto max-w-4xl px-4 py-8">
      <!-- Header -->
      <div class="mb-6 flex items-start justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ assignment?.title || "Tugas" }}
          </h1>
          <p class="mt-2 text-gray-600 dark:text-gray-300">
            Batas waktu:
            <span :class="{ 'text-red-500': isPastDue }">
              {{ assignment?.dueDate ? formatDate(assignment.dueDate) : "-" }}
            </span>
          </p>
        </div>
        <UButton
          to="/tugas"
          icon="i-heroicons-arrow-left-20-solid"
          label="Kembali"
          color="neutral"
          variant="outline"
        />
      </div>

      <!-- Konten Utama -->
      <div class="space-y-6">
        <!-- Deskripsi Tugas -->
        <UCard v-if="assignment?.description">
          <template #header>
            <h2 class="text-lg font-semibold">Deskripsi Tugas</h2>
          </template>
          <p class="whitespace-pre-line text-gray-600 dark:text-gray-300">
            {{ assignment?.description }}
          </p>
        </UCard>

        <!-- Pertanyaan -->
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Pertanyaan</h2>
          </template>
          <div class="prose dark:prose-invert max-w-none">
            <div v-html="assignment?.question || ''" />
          </div>
        </UCard>

        <!-- Form Pengumpulan -->
        <UCard v-if="assignment">
          <template #header>
            <h2 class="text-lg font-semibold">
              {{ assignment.submission ? "Edit Pengumpulan" : "Kirim Jawaban" }}
            </h2>
          </template>

          <div class="space-y-4">
            <!-- Tipe File -->
            <div v-if="assignment.type === 'file'">
              <UFormField label="Unggah File Jawaban">
                <UInput
                  type="file"
                  accept=".pdf,.doc,.docx"
                  @change="handleFileUpload"
                  :disabled="isPastDue || isSubmitting"
                />
                <p class="mt-1 text-sm text-gray-500">
                  Format: PDF/DOC/DOCX (Maks. 5MB)
                </p>
              </UFormField>

              <div v-if="assignment.submission?.fileUrl" class="mt-4">
                <p class="text-sm text-gray-500">File saat ini:</p>
                <UButton
                  :to="assignment.submission.fileUrl"
                  target="_blank"
                  icon="i-heroicons-document-arrow-down"
                  :label="assignment.submission.fileUrl.split('/').pop()"
                  variant="outline"
                  color="primary"
                />
              </div>
            </div>

            <!-- Tipe Text -->
            <div v-else>
              <UFormField label="Jawaban Anda">
                <TinymceEditor
                  v-model="formData.textAnswer"
                  :init="{ height: 300 }"
                  :disabled="isPastDue || isSubmitting"
                />
              </UFormField>

              <div v-if="assignment.submission?.submissionText" class="mt-4">
                <p class="text-sm text-gray-500">Jawaban sebelumnya:</p>
                <div class="prose dark:prose-invert mt-2 rounded-lg border p-4">
                  <div v-html="assignment.submission.submissionText" />
                </div>
              </div>
            </div>

            <!-- Tombol Submit -->
            <UButton
              :loading="isSubmitting"
              :disabled="isPastDue || isSubmitting"
              block
              color="primary"
              class="mt-6"
              @click="handleSubmit"
            >
              {{
                assignment.submission
                  ? "Perbarui Pengumpulan"
                  : isPastDue
                    ? "Batas Waktu Telah Habis"
                    : "Kirim Jawaban"
              }}
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </NuxtLayout>
</template>

<style>
.prose {
  font-size: 1rem;
  line-height: 1.6;
}

.prose img {
  max-width: 100%;
  height: auto;
  margin: 1rem 0;
}

.dark .prose {
  color: #e5e7eb;
}
</style>
