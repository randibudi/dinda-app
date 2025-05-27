<script setup lang="ts">
const title = ref("");
const description = ref("");
const type = ref<"file" | "text">("file");
const question = ref("");
const dueDate = ref("");
const grade = ref("IV");
const documentFile = ref<File | null>(null);
const isLoading = ref(false);
const toast = useToast();

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    documentFile.value = input.files[0];
  }
};

const handleCreate = async () => {
  try {
    isLoading.value = true;

    // Validasi form
    if (!title.value || !question.value || !dueDate.value) {
      throw new Error("Harap isi semua field wajib");
    }

    // Membuat FormData
    const formData = new FormData();
    formData.append("title", title.value);
    formData.append("description", description.value);
    formData.append("type", type.value);
    formData.append("question", question.value);
    formData.append("dueDate", dueDate.value);
    formData.append("grade", grade.value);

    if (type.value === "file" && documentFile.value) {
      formData.append("documentFile", documentFile.value);
    }

    // Mengirim request ke API
    const response = await $fetch("/api/assignments", {
      method: "POST",
      body: formData,
    });

    // Reset form
    title.value = "";
    description.value = "";
    type.value = "file";
    question.value = "";
    dueDate.value = "";
    grade.value = "IV";
    documentFile.value = null;

    toast.add({
      title: "Berhasil!",
      description: response.message,
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
      <div class="space-y-6">
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
          <UInput
            type="file"
            accept=".pdf"
            @change="handleFileUpload"
            class="w-full"
          />
          <p class="mt-1 text-sm text-gray-500">
            Ukuran maksimal: 2MB, Format: PDF
          </p>
        </UFormField>

        <UButton
          block
          size="lg"
          :disabled="!title || !question || !dueDate"
          :loading="isLoading"
          @click="handleCreate"
        >
          {{ isLoading ? "Menyimpan..." : "Simpan Tugas" }}
        </UButton>
      </div>
    </NuxtLayout>
  </div>
</template>
