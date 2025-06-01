<script setup lang="ts">
import type { AssignmentType } from "~~/server/db/schema";

const route = useRoute();
const id = route.params.id as string;
const title = ref("");
const description = ref("");
const type = ref<AssignmentType>("file");
const question = ref("");
const dueDate = ref("");
const grade = ref("IV");
const documentFile = ref<File | null>(null);
const existingDocument = ref("");
const isLoading = ref(false);
const toast = useToast();

// Fetch existing data
onMounted(async () => {
  try {
    isLoading.value = true;

    const { data, error } = await useFetch(`/api/assignments/${id}`);

    if (error.value) {
      throw new Error(error.value.data?.message || "Gagal memuat data tugas");
    }

    const assignment = data.value?.data;

    if (!assignment) {
      throw new Error("Tugas tidak ditemukan");
    }

    title.value = assignment.title;
    description.value = assignment.description || "";
    type.value = assignment.type;
    question.value = assignment.question;
    dueDate.value = assignment.dueDate.slice(0, 16); // Format untuk datetime-local
    grade.value = assignment.grade;
    existingDocument.value = assignment.documentUrl || "";
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.message,
      color: "error",
    });
    await navigateTo("/admin/tugas");
  } finally {
    isLoading.value = false;
  }
});

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    documentFile.value = input.files[0];
  }
};

const handleUpdate = async () => {
  try {
    isLoading.value = true;

    // Validasi field wajib
    if (!title.value || !question.value || !dueDate.value) {
      throw new Error("Harap isi semua field wajib");
    }

    // Validasi tipe tugas: jika file, pastikan ada file baru atau file yang sudah ada
    if (type.value === "file") {
      if (!existingDocument.value && !documentFile.value) {
        throw new Error("File diperlukan untuk tipe tugas file");
      }
    }

    // Validasi file jika diunggah
    if (documentFile.value) {
      if (documentFile.value.type !== "application/pdf") {
        throw new Error("Hanya file PDF yang diperbolehkan");
      }
      if (documentFile.value.size > 2 * 1024 * 1024) {
        throw new Error("Ukuran file melebihi batas 2MB");
      }
    }

    // Membuat FormData untuk mengirim data
    const formData = new FormData();
    formData.append("title", title.value);
    formData.append("description", description.value);
    formData.append("type", type.value);
    formData.append("question", question.value);
    formData.append("dueDate", dueDate.value);
    formData.append("grade", grade.value);

    // Jika ada file baru, tambahkan ke FormData
    if (documentFile.value) {
      formData.append("documentFile", documentFile.value);
    }

    // Menggunakan $fetch untuk mengirim data
    const response = await $fetch(`/api/assignments/${id}`, {
      method: "PUT",
      body: formData,
    });

    toast.add({
      title: "Berhasil!",
      description: "Tugas berhasil diperbarui",
      color: "success",
    });

    await navigateTo("/admin/tugas");
  } catch (error: any) {
    toast.add({
      title: "Gagal!",
      description: error.data?.message || error.message,
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <NuxtLayout>
      <div class="space-y-6 p-4">
        <UFormField label="Judul Tugas" size="lg" required>
          <UInput
            v-model="title"
            type="text"
            placeholder="Masukkan Judul Tugas"
            icon="i-heroicons-document-text-20-solid"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Deskripsi Tugas" size="lg">
          <UTextarea
            v-model="description"
            placeholder="Masukkan deskripsi tugas (opsional)"
            autoresize
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Tipe Tugas" size="lg" required>
            <USelect
              v-model="type"
              :items="[
                { value: 'file', label: 'Upload File' },
                { value: 'text', label: 'Jawaban Teks' },
              ]"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Kelas" size="lg" required>
            <USelect
              v-model="grade"
              :items="['IV', 'V', 'VI']"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField label="Batas Waktu" size="lg" required>
          <UInput
            v-model="dueDate"
            type="datetime-local"
            icon="i-heroicons-calendar-days-20-solid"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Pertanyaan/Petunjuk" size="lg" required>
          <TinymceEditor v-model="question" />
        </UFormField>

        <UFormField v-if="type === 'file'" label="Dokumen Soal (PDF)" size="lg">
          <div class="space-y-2">
            <UInput
              type="file"
              accept=".pdf"
              @change="handleFileUpload"
              class="w-full"
            />
            <p class="text-sm text-gray-500">
              <span v-if="existingDocument">
                Dokumen saat ini:
                <a
                  :href="existingDocument"
                  target="_blank"
                  class="text-primary hover:underline"
                >
                  Lihat Dokumen
                </a>
                <br />
              </span>
              Ukuran maksimal: 2MB, Format: PDF
            </p>
          </div>
        </UFormField>

        <UButton
          block
          size="lg"
          :disabled="!title || !question || !dueDate"
          :loading="isLoading"
          @click="handleUpdate"
        >
          {{ isLoading ? "Memperbarui..." : "Perbarui Tugas" }}
        </UButton>
      </div>
    </NuxtLayout>
  </div>
</template>
