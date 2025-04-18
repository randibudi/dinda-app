<script setup lang="ts">
const title = ref("");
const content = ref("");
const file = ref<File | null>(null);
const isLoading = ref(false);
const toast = useToast();

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    file.value = input.files[0];
  }
};

const handleCreate = async () => {
  try {
    isLoading.value = true;

    // Validasi file
    if (file.value) {
      // Cek tipe file
      if (file.value.type !== "application/pdf") {
        throw new Error("Hanya file PDF yang diperbolehkan");
      }

      // Cek ukuran file (2MB)
      if (file.value.size > 2 * 1024 * 1024) {
        throw new Error("Ukuran file melebihi batas 2MB");
      }
    }

    // Membuat FormData
    const formData = new FormData();
    formData.append("title", title.value);
    formData.append("content", content.value);
    if (file.value) {
      formData.append("documentFile", file.value);
    }

    // Mengirim request
    const response = await $fetch("/api/learning-materials", {
      method: "POST",
      body: formData,
    });

    // Reset form setelah sukses
    title.value = "";
    content.value = "";
    file.value = null;

    toast.add({
      title: "Berhasil!",
      description: response.message,
      color: "success",
    });

    // Redirect ke halaman list materi (sesuaikan dengan route Anda)
    await navigateTo("/admin/materi");
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
        <UFormField label="Judul Materi" size="lg" required>
          <UInput
            v-model="title"
            type="text"
            placeholder="Masukkan Judul Materi"
            icon="i-heroicons-bookmark-square-20-solid"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Konten Materi" size="lg" required>
          <TinymceEditor v-model="content" />
        </UFormField>

        <UFormField label="Dokumen Pendukung (PDF)" size="lg">
          <UInput type="file" accept=".pdf" @change="handleFileUpload" />
          <p class="mt-1 text-sm text-gray-500">
            Ukuran maksimal: 2MB, Format: PDF
          </p>
        </UFormField>

        <UButton
          block
          size="lg"
          :disabled="!title || !content"
          :loading="isLoading"
          @click="handleCreate()"
        >
          Simpan
        </UButton>
      </div>
    </NuxtLayout>
  </div>
</template>
