<script setup lang="ts">
const route = useRoute();
const id = route.params.id as string;
const title = ref("");
const content = ref("");
const file = ref<File | null>(null);
const existingDocument = ref("");
const isLoading = ref(false);
const toast = useToast();

// Fetch existing material data
onMounted(async () => {
  try {
    const response = await $fetch(`/api/learning-materials/${id}`);
    title.value = response.data.title;
    content.value = response.data.content;
    existingDocument.value = response.data.documentUrl || "";
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Gagal memuat data materi",
      color: "error",
    });
    await navigateTo("/admin/materi");
  }
});

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    file.value = input.files[0];
  }
};

const handleUpdate = async () => {
  try {
    isLoading.value = true;

    // Validasi file
    if (file.value) {
      if (file.value.type !== "application/pdf") {
        throw new Error("Hanya file PDF yang diperbolehkan");
      }
      if (file.value.size > 2 * 1024 * 1024) {
        throw new Error("Ukuran file melebihi batas 2MB");
      }
    }

    const formData = new FormData();
    formData.append("title", title.value);
    formData.append("content", content.value);
    if (file.value) {
      formData.append("documentFile", file.value);
    }

    const response = await $fetch(`/api/learning-materials/${id}`, {
      method: "PUT",
      body: formData,
    });

    toast.add({
      title: "Berhasil!",
      description: "Materi berhasil diperbarui",
      color: "success",
    });

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
          <div class="space-y-2">
            <UInput type="file" accept=".pdf" @change="handleFileUpload" />
            <p class="text-sm text-gray-500">
              <span v-if="existingDocument">
                Dokumen saat ini:
                <a
                  :href="existingDocument"
                  target="_blank"
                  class="text-primary hover:underline"
                  >Lihat Dokumen</a
                >
                <br />
              </span>
              Ukuran maksimal: 2MB, Format: PDF
            </p>
          </div>
        </UFormField>

        <UButton
          block
          size="lg"
          :disabled="!title || !content"
          :loading="isLoading"
          @click="handleUpdate"
        >
          Perbarui Materi
        </UButton>
      </div>
    </NuxtLayout>
  </div>
</template>
